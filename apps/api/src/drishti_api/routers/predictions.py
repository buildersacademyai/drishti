import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..models.ml import Prediction

router = APIRouter()


@router.get("")
def get_predictions(admin_unit_id: uuid.UUID | None = None,
                    horizon: str | None = None, db: Session = Depends(get_db)):
    stmt = select(Prediction)
    if admin_unit_id:
        stmt = stmt.where(Prediction.admin_unit_id == admin_unit_id)
    if horizon:
        stmt = stmt.where(Prediction.target_horizon == horizon)
    rows = db.execute(stmt).scalars().all()
    return [{"id": str(p.id), "admin_unit_id": str(p.admin_unit_id),
             "risk_score": p.risk_score, "uncertainty": p.uncertainty,
             "target_horizon": p.target_horizon,
             "target_date": p.target_date.isoformat() if p.target_date else None} for p in rows]
