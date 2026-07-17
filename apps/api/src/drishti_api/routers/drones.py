import ipaddress
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..config import settings
from ..db import get_db
from ..models.drone import Drone
from ..services.drone_telemetry_service import HEARTBEAT_TIMEOUT_S, MESSAGE_TIMEOUT_S
from ..workers.drone_telemetry import connect_now, disconnect_now

router = APIRouter()

CONNECTION_STALE_AFTER_S = 30  # 3x the beat poll interval
# Worst case inside poll_drone_telemetry: one heartbeat wait plus three
# sequential message timeouts (position, sys_status, gps_raw) if the drone
# doesn't send some of those message types at all. +5s margin for task
# queue/broker round-trip overhead.
WORKER_RESPONSE_TIMEOUT_S = HEARTBEAT_TIMEOUT_S + 3 * MESSAGE_TIMEOUT_S + 5

VALID_STATUSES = {"at_station", "in_field", "charging", "maintenance", "offline"}
VALID_CONNECTION_SCHEMES = ("udp:", "udpout:", "udpin:", "tcp:")


def _validate_connection_string(connection_string: str) -> None:
    if connection_string and not connection_string.startswith(VALID_CONNECTION_SCHEMES):
        raise HTTPException(
            status_code=422,
            detail=f"connection_string must start with one of {VALID_CONNECTION_SCHEMES}",
        )


def _validate_telemetry_source_ip(telemetry_source_ip: str) -> None:
    if not telemetry_source_ip:
        return
    try:
        ipaddress.ip_address(telemetry_source_ip)
    except ValueError:
        raise HTTPException(status_code=422, detail="telemetry_source_ip must be a valid IP address")


class CreateDroneRequest(BaseModel):
    name: str
    model: str = ""
    serial_number: str = ""
    home_lat: float | None = None
    home_lng: float | None = None
    notes: str = ""
    connection_string: str = ""
    telemetry_source_ip: str = ""


class UpdateDroneRequest(BaseModel):
    name: str | None = None
    model: str | None = None
    serial_number: str | None = None
    home_lat: float | None = None
    home_lng: float | None = None
    status: str | None = None
    battery_pct: int | None = None
    current_lat: float | None = None
    current_lng: float | None = None
    notes: str | None = None
    current_mission_id: str | None = None
    connection_string: str | None = None
    telemetry_source_ip: str | None = None


def _is_connected(d: Drone) -> bool:
    if d.telemetry_paused or not d.connection_string or not d.last_seen:
        return False
    return (datetime.utcnow() - d.last_seen).total_seconds() < CONNECTION_STALE_AFTER_S


def _serialize(d: Drone) -> dict:
    return {
        "id": str(d.id),
        "name": d.name,
        "model": d.model or "",
        "serial_number": d.serial_number or "",
        "connection_string": d.connection_string or "",
        "telemetry_source_ip": d.telemetry_source_ip or "",
        "connected": _is_connected(d),
        "telemetry_paused": d.telemetry_paused,
        "status": d.status,
        "battery_pct": d.battery_pct,
        "total_flight_hours": d.total_flight_hours or 0,
        "last_seen": d.last_seen.isoformat() if d.last_seen else None,
        "current_mission_id": str(d.current_mission_id) if d.current_mission_id else None,
        "home_lat": d.home_lat,
        "home_lng": d.home_lng,
        "current_lat": d.current_lat,
        "current_lng": d.current_lng,
        "altitude_m": d.altitude_m,
        "heading_deg": d.heading_deg,
        "speed_mps": d.speed_mps,
        "gps_fix_type": d.gps_fix_type,
        "satellites_visible": d.satellites_visible,
        "notes": d.notes or "",
        "registered_at": d.registered_at.isoformat() if d.registered_at else None,
    }


@router.get("")
def list_drones(db: Session = Depends(get_db)):
    rows = db.execute(select(Drone).order_by(Drone.registered_at)).scalars().all()
    return [_serialize(d) for d in rows]


@router.get("/{drone_id}")
def get_drone(drone_id: uuid.UUID, db: Session = Depends(get_db)):
    d = db.get(Drone, drone_id)
    if not d:
        raise HTTPException(status_code=404, detail="Drone not found")
    return _serialize(d)


@router.post("", status_code=201)
def create_drone(body: CreateDroneRequest, db: Session = Depends(get_db)):
    _validate_connection_string(body.connection_string)
    _validate_telemetry_source_ip(body.telemetry_source_ip)
    d = Drone(
        id=uuid.uuid4(),
        tenant_id=settings.seed_tenant_id,
        name=body.name,
        model=body.model or None,
        serial_number=body.serial_number or None,
        connection_string=body.connection_string or None,
        telemetry_source_ip=body.telemetry_source_ip or None,
        status="at_station",
        home_lat=body.home_lat,
        home_lng=body.home_lng,
        notes=body.notes or None,
        registered_at=datetime.utcnow(),
    )
    db.add(d)
    db.commit()
    return _serialize(d)


@router.patch("/{drone_id}")
def update_drone(drone_id: uuid.UUID, body: UpdateDroneRequest, db: Session = Depends(get_db)):
    d = db.get(Drone, drone_id)
    if not d:
        raise HTTPException(status_code=404, detail="Drone not found")
    if body.name is not None:
        d.name = body.name
    if body.model is not None:
        d.model = body.model or None
    if body.serial_number is not None:
        d.serial_number = body.serial_number or None
    if body.home_lat is not None:
        d.home_lat = body.home_lat
    if body.home_lng is not None:
        d.home_lng = body.home_lng
    if body.status is not None:
        if body.status not in VALID_STATUSES:
            raise HTTPException(status_code=422, detail=f"Invalid status. Valid: {VALID_STATUSES}")
        d.status = body.status
    if body.battery_pct is not None:
        d.battery_pct = max(0, min(100, body.battery_pct))
    if body.current_lat is not None:
        d.current_lat = body.current_lat
    if body.current_lng is not None:
        d.current_lng = body.current_lng
    if body.notes is not None:
        d.notes = body.notes
    if body.connection_string is not None:
        _validate_connection_string(body.connection_string)
        d.connection_string = body.connection_string or None
    if body.telemetry_source_ip is not None:
        _validate_telemetry_source_ip(body.telemetry_source_ip)
        d.telemetry_source_ip = body.telemetry_source_ip or None
    if body.current_mission_id is not None:
        d.current_mission_id = uuid.UUID(body.current_mission_id)
    d.last_seen = datetime.utcnow()
    db.commit()
    return _serialize(d)


@router.post("/{drone_id}/connect")
def connect_drone(drone_id: uuid.UUID, db: Session = Depends(get_db)):
    d = db.get(Drone, drone_id)
    if not d:
        raise HTTPException(status_code=404, detail="Drone not found")
    if not d.connection_string:
        raise HTTPException(status_code=422, detail="No connection_string configured for this drone")
    # Dispatched to the worker rather than run here: the persistent MAVLink
    # connection cache only lives in the worker process, and only one
    # process can hold the UDP socket for a given connection_string at a
    # time — the API process opening its own would race the worker for it.
    try:
        return connect_now.apply_async(args=[str(drone_id)]).get(timeout=WORKER_RESPONSE_TIMEOUT_S)
    except Exception:
        raise HTTPException(status_code=504, detail="Drone did not respond in time")


@router.post("/{drone_id}/disconnect")
def disconnect_drone(drone_id: uuid.UUID, db: Session = Depends(get_db)):
    d = db.get(Drone, drone_id)
    if not d:
        raise HTTPException(status_code=404, detail="Drone not found")
    try:
        return disconnect_now.apply_async(args=[str(drone_id)]).get(timeout=WORKER_RESPONSE_TIMEOUT_S)
    except Exception:
        raise HTTPException(status_code=504, detail="Could not reach worker to disconnect")


@router.delete("/{drone_id}", status_code=204)
def delete_drone(drone_id: uuid.UUID, db: Session = Depends(get_db)):
    d = db.get(Drone, drone_id)
    if not d:
        raise HTTPException(status_code=404, detail="Drone not found")
    db.delete(d)
    db.commit()
