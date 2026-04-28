import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.iot import SensorReading

router = APIRouter()


@router.post("/readings", status_code=201)
def ingest_reading(body: dict, db: Session = Depends(get_db)):
    reading = SensorReading(
        sensor_id=uuid.UUID(body["sensor_id"]),
        temp_c=body.get("temp_c"),
        humidity_pct=body.get("humidity_pct"),
        rainfall_mm=body.get("rainfall_mm"),
        payload_jsonb=body.get("payload_jsonb", {}),
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return {"id": str(reading.id)}
