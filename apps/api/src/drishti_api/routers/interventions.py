import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..models.intervention import Intervention
from ..models.drone import Mission, Drone
from ..models.detection import Detection
from ..dependencies import require_role, CurrentUser
from ..config import settings

router = APIRouter()


@router.post("", status_code=201)
def create_intervention(body: dict, db: Session = Depends(get_db)):
    obj = Intervention(
        tenant_id=settings.seed_tenant_id,
        detection_id=uuid.UUID(body["detection_id"]) if body.get("detection_id") else None,
        mission_id=uuid.UUID(body["mission_id"]) if body.get("mission_id") else None,
        intervention_type=body.get("intervention_type", "larvicide_spray"),
        larvicide_ml=body.get("larvicide_ml"),
        operator_notes=body.get("operator_notes"),
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return {"id": str(obj.id), "intervention_type": obj.intervention_type}


@router.get("")
def list_interventions(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Intervention, Mission.status).outerjoin(Mission, Intervention.mission_id == Mission.id)
        .order_by(Intervention.executed_at.desc().nullsfirst())
    ).all()
    return [{"id": str(i.id), "intervention_type": i.intervention_type,
             "larvicide_ml": i.larvicide_ml,
             "status": mstatus or ("completed" if i.executed_at else None),
             "executed_at": i.executed_at.isoformat() if i.executed_at else None} for i, mstatus in rows]


@router.post("/start", status_code=201)
def start_intervention(
    body: dict,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role("admin")),
):
    """Admin: pick a detection + drone, create an in-progress intervention mission and dispatch the drone."""
    try:
        det = db.get(Detection, uuid.UUID(body["detection_id"]))
        drone = db.get(Drone, uuid.UUID(body["drone_id"]))
    except (KeyError, ValueError):
        raise HTTPException(status_code=422, detail="detection_id and drone_id are required")
    if not det or str(det.tenant_id) != user.tenant_id:
        raise HTTPException(status_code=404, detail="Detection not found")
    if not drone or str(drone.tenant_id) != user.tenant_id:
        raise HTTPException(status_code=404, detail="Drone not found")
    if drone.status != "at_station" or drone.current_mission_id:
        raise HTTPException(status_code=409, detail=f"Drone is not available (status: {drone.status})")
    src = db.get(Mission, det.mission_id) if det.mission_id else None
    if not src:
        raise HTTPException(status_code=422, detail="Detection has no linked mission, so its district is unknown")
    mission = Mission(
        tenant_id=det.tenant_id, mission_type="intervention", status="in_progress",
        admin_unit_id=src.admin_unit_id, triggered_by=f"admin:{user.user_id}",
        executed_at=datetime.utcnow(),
    )
    db.add(mission)
    db.flush()
    obj = Intervention(
        tenant_id=det.tenant_id, detection_id=det.id, mission_id=mission.id,
        intervention_type=body.get("intervention_type") or "larvicide_spray",
        target_geometry=det.geometry, executed_at=None,
        larvicide_ml=body.get("larvicide_ml"), operator_notes=body.get("operator_notes"),
    )
    db.add(obj)
    drone.current_mission_id = mission.id
    drone.status = "in_field"
    db.commit()
    return {"id": str(obj.id), "mission_id": str(mission.id), "drone_id": str(drone.id)}


@router.delete("/{intervention_id}", status_code=204)
def delete_intervention(
    intervention_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role("admin")),
):
    obj = db.get(Intervention, intervention_id)
    if not obj or str(obj.tenant_id) != user.tenant_id:
        raise HTTPException(status_code=404, detail="Intervention not found")
    mission_id = obj.mission_id
    db.delete(obj)
    db.flush()
    mission = db.get(Mission, mission_id) if mission_id else None
    if mission and mission.mission_type == "intervention" and mission.status != "completed":
        # cancel: free the drone, drop the mission if nothing else hangs off it
        for d in db.query(Drone).filter(Drone.current_mission_id == mission.id, Drone.tenant_id == mission.tenant_id):
            d.current_mission_id = None
            if d.status == "in_field":
                d.status = "at_station"
        from ..models.drone import Flight
        in_use = (
            db.query(Flight).filter(Flight.mission_id == mission.id).first()
            or db.query(Detection).filter(Detection.mission_id == mission.id).first()
            or db.query(Intervention).filter(Intervention.mission_id == mission.id).first()
        )
        if not in_use:
            db.delete(mission)
    db.commit()
