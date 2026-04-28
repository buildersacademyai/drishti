import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..models.drone import Mission
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
    return [{"id": str(m.id), "status": m.status, "mission_type": m.mission_type} for m in missions]


@router.post("/{mission_id}/dispatch", status_code=200)
def dispatch_mission(mission_id: uuid.UUID, db: Session = Depends(get_db)):
    mission = db.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    mission.status = "in_progress"
    db.commit()
    return {"id": str(mission.id), "status": mission.status}
