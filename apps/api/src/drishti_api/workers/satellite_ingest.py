from ..db import SessionLocal
from ..models.base import SEED_TENANT_ID
from ..services.satellite_ingest_service import run_ingestion_for_all_admin_units
from .celery_app import celery_app


@celery_app.task(name="satellite.ingest_district")
def ingest_district() -> dict:
    db = SessionLocal()
    try:
        results = run_ingestion_for_all_admin_units(db, tenant_id=SEED_TENANT_ID)
        db.commit()
        return {
            "status": "completed",
            "districts_scanned": len(results),
            "new_sites_detected": sum(r["new_site_count"] for r in results),
        }
    finally:
        db.close()
