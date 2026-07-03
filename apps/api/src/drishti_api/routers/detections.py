import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..models.detection import Detection
from ..models.drone import Mission
from ..models.intervention import AuditLog
from ..dependencies import get_current_user, CurrentUser
from ..config import settings

router = APIRouter()


@router.get("")
def list_detections(mission_id: uuid.UUID | None = None, detection_type: str | None = None,
                    confidence_min: float | None = None, status: str | None = None,
                    db: Session = Depends(get_db)):
    stmt = select(Detection)
    if mission_id:
        stmt = stmt.where(Detection.mission_id == mission_id)
    if detection_type:
        stmt = stmt.where(Detection.detection_type == detection_type)
    if confidence_min is not None:
        stmt = stmt.where(Detection.confidence >= confidence_min)
    if status:
        stmt = stmt.where(Detection.status == status)
    rows = db.execute(stmt).scalars().all()
    return [{"id": str(d.id), "detection_type": d.detection_type,
             "confidence": d.confidence,
             "mission_id": str(d.mission_id) if d.mission_id else None,
             "detected_at": d.detected_at.isoformat() if d.detected_at else None,
             "status": d.status} for d in rows]


@router.post("/{detection_id}/verify", status_code=200)
def verify_detection(detection_id: uuid.UUID, db: Session = Depends(get_db),
                     user: CurrentUser = Depends(get_current_user)):
    det = db.get(Detection, detection_id)
    if not det:
        raise HTTPException(status_code=404, detail="Detection not found")
    if det.status != "pending_review":
        raise HTTPException(status_code=422,
                            detail=f"Detection is already {det.status}, cannot verify")
    det.status = "verified"
    det.verified_by = uuid.UUID(user.user_id)
    det.verified_at = datetime.utcnow()
    db.add(AuditLog(
        tenant_id=settings.seed_tenant_id, actor_id=uuid.UUID(user.user_id),
        action="detection_verified", entity_type="detection", entity_id=det.id,
        payload_jsonb={},
    ))
    db.commit()
    db.refresh(det)
    return {"id": str(det.id), "status": det.status, "verified_by": str(det.verified_by),
            "verified_at": det.verified_at.isoformat()}


@router.post("/{detection_id}/reject", status_code=200)
def reject_detection(detection_id: uuid.UUID, body: dict | None = None,
                     db: Session = Depends(get_db),
                     user: CurrentUser = Depends(get_current_user)):
    det = db.get(Detection, detection_id)
    if not det:
        raise HTTPException(status_code=404, detail="Detection not found")
    if det.status != "pending_review":
        raise HTTPException(status_code=422,
                            detail=f"Detection is already {det.status}, cannot reject")
    reason = (body or {}).get("reason")
    det.status = "rejected"
    det.verified_by = uuid.UUID(user.user_id)
    det.verified_at = datetime.utcnow()
    db.add(AuditLog(
        tenant_id=settings.seed_tenant_id, actor_id=uuid.UUID(user.user_id),
        action="detection_rejected", entity_type="detection", entity_id=det.id,
        payload_jsonb={"reason": reason},
    ))
    db.commit()
    db.refresh(det)
    return {"id": str(det.id), "status": det.status, "verified_by": str(det.verified_by),
            "verified_at": det.verified_at.isoformat()}


@router.post("/{detection_id}/trigger-intervention", status_code=200)
def trigger_intervention(detection_id: uuid.UUID, db: Session = Depends(get_db)):
    det = db.get(Detection, detection_id)
    if not det:
        raise HTTPException(status_code=404, detail="Detection not found")
    if det.detection_type != "larvae_confirmed":
        raise HTTPException(status_code=422,
                            detail="Only larvae_confirmed detections trigger intervention")
    if det.status != "verified":
        raise HTTPException(status_code=422,
                            detail="Detection must be verified before triggering intervention")
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
