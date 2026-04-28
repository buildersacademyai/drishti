import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..models.detection import Detection
from ..models.drone import Mission
from ..config import settings

router = APIRouter()


@router.get("")
def list_detections(mission_id: uuid.UUID | None = None, detection_type: str | None = None,
                    confidence_min: float | None = None, db: Session = Depends(get_db)):
    stmt = select(Detection)
    if mission_id:
        stmt = stmt.where(Detection.mission_id == mission_id)
    if detection_type:
        stmt = stmt.where(Detection.detection_type == detection_type)
    if confidence_min is not None:
        stmt = stmt.where(Detection.confidence >= confidence_min)
    rows = db.execute(stmt).scalars().all()
    return [{"id": str(d.id), "detection_type": d.detection_type,
             "confidence": d.confidence,
             "mission_id": str(d.mission_id) if d.mission_id else None,
             "detected_at": d.detected_at.isoformat() if d.detected_at else None} for d in rows]


@router.post("/{detection_id}/trigger-intervention", status_code=200)
def trigger_intervention(detection_id: uuid.UUID, db: Session = Depends(get_db)):
    det = db.get(Detection, detection_id)
    if not det:
        raise HTTPException(status_code=404, detail="Detection not found")
    if det.detection_type != "larvae_confirmed":
        raise HTTPException(status_code=422,
                            detail="Only larvae_confirmed detections trigger intervention")
    linked_mission = db.get(Mission, det.mission_id) if det.mission_id else None
    admin_unit_id = linked_mission.admin_unit_id if linked_mission else settings.seed_tenant_id
    intervention_mission = Mission(
        tenant_id=settings.seed_tenant_id, mission_type="intervention",
        status="planned", admin_unit_id=admin_unit_id,
        triggered_by=f"detection:{detection_id}",
    )
    db.add(intervention_mission)
    db.commit()
    db.refresh(intervention_mission)
    return {"detection_id": str(det.id), "intervention_mission_id": str(intervention_mission.id)}
