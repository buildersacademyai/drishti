import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..dependencies import get_current_user, CurrentUser
from ..models.drone import Mission
from ..schemas.missions import MissionStatusUpdate
from ..config import settings

router = APIRouter()


@router.post("", status_code=201)
def create_mission(body: dict, db: Session = Depends(get_db)):
    mission = Mission(
        tenant_id=settings.seed_tenant_id,
        mission_type=body["mission_type"],
        status="planned",
        admin_unit_id=uuid.UUID(body["admin_unit_id"]),
        triggered_by=body.get("triggered_by"),
    )
    db.add(mission)
    db.commit()
    db.refresh(mission)
    return {"id": str(mission.id), "status": mission.status, "mission_type": mission.mission_type}


@router.get("")
def list_missions(status: str | None = None, mission_type: str | None = None,
                  db: Session = Depends(get_db)):
    stmt = select(Mission)
    if status:
        stmt = stmt.where(Mission.status == status)
    if mission_type:
        stmt = stmt.where(Mission.mission_type == mission_type)
    missions = db.execute(stmt).scalars().all()
    return [
        {
            "id": str(m.id),
            "status": m.status,
            "mission_type": m.mission_type,
            "admin_unit_id": str(m.admin_unit_id),
            "satellite_detection_id": str(m.satellite_detection_id) if m.satellite_detection_id else None,
            "planned_at": m.planned_at.isoformat() if m.planned_at else None,
        }
        for m in missions
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
    if body.status == "completed" and mission.executed_at is None:
        mission.executed_at = datetime.utcnow()
    db.commit()
    return {
        "id": str(mission.id),
        "status": mission.status,
        "executed_at": mission.executed_at.isoformat() if mission.executed_at else None,
    }
