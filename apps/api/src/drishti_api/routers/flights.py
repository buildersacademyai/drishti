import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.drone import Flight
from ..config import settings

router = APIRouter()


@router.post("", status_code=201)
def create_flight(body: dict, db: Session = Depends(get_db)):
    flight = Flight(
        tenant_id=settings.seed_tenant_id,
        mission_id=uuid.UUID(body["mission_id"]),
        payload_type=body.get("payload_type", "camera"),
        mission_path_jsonb=body.get("mission_path_jsonb", {}),
    )
    db.add(flight)
    db.commit()
    db.refresh(flight)
    return {"id": str(flight.id), "payload_type": flight.payload_type}
