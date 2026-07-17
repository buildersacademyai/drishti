from ..db import SessionLocal
from ..services.drone_telemetry_service import poll_all_drones
from .celery_app import celery_app


@celery_app.task(name="drone.poll_telemetry")
def poll_telemetry() -> dict:
    db = SessionLocal()
    try:
        updated = poll_all_drones(db)
        db.commit()
        return {"status": "completed", "drones_updated": len(updated)}
    finally:
        db.close()
