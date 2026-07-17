import uuid

from ..db import SessionLocal
from ..models.drone import Drone
from ..services.drone_telemetry_service import (
    pause_drone_telemetry,
    poll_all_drones,
    poll_drone_connection_now,
    resume_drone_telemetry,
)
from .celery_app import celery_app


@celery_app.task(name="drone.poll_telemetry")
def poll_telemetry() -> dict:
    db = SessionLocal()
    try:
        updated = poll_all_drones(db)
        db.commit()
        return {"status": "completed", "drones_updated": len(updated)}
    finally:
        db.close()


@celery_app.task(name="drone.connect_now")
def connect_now(drone_id: str) -> dict:
    """Runs in the worker process, not the API process — the persistent
    MAVLink connection cache (services/drone_telemetry_service._connections)
    only lives in the worker, so any code that opens a real connection has
    to run here too. The API router dispatches this task and waits for the
    result instead of touching pymavlink itself.
    """
    db = SessionLocal()
    try:
        drone = db.get(Drone, uuid.UUID(drone_id))
        if drone is None:
            return {"connected": False, "error": "not_found"}
        resume_drone_telemetry(db, drone)
        snapshot = poll_drone_connection_now(db, drone)
        db.commit()
        if snapshot is None:
            return {"connected": False}
        return {"connected": True, **snapshot}
    finally:
        db.close()


@celery_app.task(name="drone.disconnect_now")
def disconnect_now(drone_id: str) -> dict:
    db = SessionLocal()
    try:
        drone = db.get(Drone, uuid.UUID(drone_id))
        if drone is None:
            return {"telemetry_paused": False, "error": "not_found"}
        pause_drone_telemetry(db, drone)
        db.commit()
        return {"telemetry_paused": True}
    finally:
        db.close()
