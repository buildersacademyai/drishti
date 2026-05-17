import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..models.intervention import Alert

router = APIRouter()


@router.get("/active")
def get_active_alerts(db: Session = Depends(get_db)):
    stmt = select(Alert).where(Alert.acknowledged_at == None)  # noqa: E711
    rows = db.execute(stmt).scalars().all()
    return [
        {
            "id": str(a.id),
            "severity": a.severity,
            "channel": a.channel,
            "recipient_role": a.recipient_role,
            "created_at": a.sent_at.isoformat() if a.sent_at else None,
        }
        for a in rows
    ]


@router.get("")
def list_all_alerts(db: Session = Depends(get_db)):
    rows = db.execute(select(Alert).order_by(Alert.sent_at.desc())).scalars().all()
    return [
        {
            "id": str(a.id),
            "severity": a.severity,
            "channel": a.channel,
            "recipient_role": a.recipient_role,
            "acknowledged_at": a.acknowledged_at.isoformat() if a.acknowledged_at else None,
            "created_at": a.sent_at.isoformat() if a.sent_at else None,
        }
        for a in rows
    ]


@router.post("/{alert_id}/acknowledge", status_code=200)
def acknowledge_alert(alert_id: uuid.UUID, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged_at = datetime.utcnow()
    db.commit()
    return {"id": str(alert.id), "acknowledged_at": alert.acknowledged_at.isoformat()}
