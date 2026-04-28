import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..models.intervention import Alert

router = APIRouter()


@router.get("/active")
def get_active_alerts(db: Session = Depends(get_db)):
    stmt = select(Alert).where(Alert.acknowledged_at == None)  # noqa: E711
    rows = db.execute(stmt).scalars().all()
    return [{"id": str(a.id), "severity": a.severity, "channel": a.channel} for a in rows]
