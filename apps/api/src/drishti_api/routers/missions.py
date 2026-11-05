import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..dependencies import get_current_user, require_role, CurrentUser
from ..models.drone import Mission, Flight, Drone
from ..models.detection import Detection
from ..models.intervention import Intervention
from ..models.geo import AdminUnit
from ..schemas.missions import MissionStatusUpdate
from ..services.mission_service import create_detection_from_completed_mission
from ..config import settings

router = APIRouter()


@router.post("", status_code=201)
def create_mission(body: dict, db: Session = Depends(get_db)):
    mission = Mission(
        tenant_id=settings.seed_tenant_id,
        name=body.get("name"),
        mission_type=body["mission_type"],
        status="planned",
        admin_unit_id=uuid.UUID(body["admin_unit_id"]),
        triggered_by=body.get("triggered_by"),
    )
    db.add(mission)
    db.commit()
    db.refresh(mission)
    return {"id": str(mission.id), "name": mission.name, "status": mission.status,
            "mission_type": mission.mission_type}


@router.get("")
def list_missions(status: str | None = None, mission_type: str | None = None,
                  db: Session = Depends(get_db)):
    stmt = select(Mission, AdminUnit.name).join(AdminUnit, Mission.admin_unit_id == AdminUnit.id)
    if status:
        stmt = stmt.where(Mission.status == status)
    if mission_type:
        stmt = stmt.where(Mission.mission_type == mission_type)
    rows = db.execute(stmt).all()
    return [
        {
            "id": str(m.id),
            "name": m.name,
            "status": m.status,
            "mission_type": m.mission_type,
            "admin_unit_id": str(m.admin_unit_id),
            "admin_unit_name": admin_unit_name,
            "satellite_detection_id": str(m.satellite_detection_id) if m.satellite_detection_id else None,
            "planned_at": m.planned_at.isoformat() if m.planned_at else None,
        }
        for m, admin_unit_name in rows
    ]


@router.post("/{mission_id}/dispatch", status_code=200)
def dispatch_mission(mission_id: uuid.UUID, db: Session = Depends(get_db)):
    mission = db.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    mission.status = "in_progress"
    db.commit()
    return {"id": str(mission.id), "status": mission.status}


@router.patch("/{mission_id}")
def update_mission_status(
    mission_id: uuid.UUID,
    body: MissionStatusUpdate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    mission = db.get(Mission, mission_id)
    if not mission or str(mission.tenant_id) != user.tenant_id:
        raise HTTPException(status_code=404, detail="Mission not found")

    mission.status = body.status
    detection = None
    if body.status == "completed":
        if mission.executed_at is None:
            mission.executed_at = datetime.utcnow()
        detection = create_detection_from_completed_mission(db, mission)
    db.commit()
    return {
        "id": str(mission.id),
        "status": mission.status,
        "executed_at": mission.executed_at.isoformat() if mission.executed_at else None,
        "detection_id": str(detection.id) if detection else None,
    }


@router.delete("/{mission_id}", status_code=204)
def delete_mission(
    mission_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role("admin")),
):
    mission = db.get(Mission, mission_id)
    unit = db.get(AdminUnit, mission.admin_unit_id) if mission else None
    if not unit or str(unit.tenant_id) != user.tenant_id:
        raise HTTPException(status_code=404, detail="Mission not found")
    for model, label in ((Flight, "flights"), (Detection, "detections"), (Intervention, "interventions")):
        if db.query(model).filter(model.mission_id == mission.id).first():
            raise HTTPException(status_code=409, detail=f"Mission has {label} recorded against it")
    db.query(Drone).filter(Drone.current_mission_id == mission.id, Drone.tenant_id == mission.tenant_id).update(
        {Drone.current_mission_id: None}, synchronize_session=False
    )
    db.delete(mission)
    db.commit()
