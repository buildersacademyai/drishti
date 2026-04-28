import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..models.intervention import Intervention
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
    rows = db.execute(select(Intervention)).scalars().all()
    return [{"id": str(i.id), "intervention_type": i.intervention_type,
             "larvicide_ml": i.larvicide_ml,
             "executed_at": i.executed_at.isoformat() if i.executed_at else None} for i in rows]
