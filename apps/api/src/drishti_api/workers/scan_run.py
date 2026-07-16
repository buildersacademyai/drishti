from ..db import SessionLocal
from ..models.base import SEED_TENANT_ID
from ..services.prediction_service import run_scan_for_all_admin_units
from .celery_app import celery_app


@celery_app.task(name="scan.run_daily_risk_scan")
def run_daily_risk_scan() -> dict:
    db = SessionLocal()
    try:
        try:
            results = run_scan_for_all_admin_units(db, tenant_id=SEED_TENANT_ID)
            db.commit()
        except ImportError:
            db.rollback()
            return {"status": "error", "error": "drishti_predict not installed"}
        return {"status": "completed", "districts_scanned": len(results),
                "alerts_created": sum(1 for r in results if r["alert_id"] is not None)}
    finally:
        db.close()
