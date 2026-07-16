from ..db import SessionLocal
from ..models.geo import AdminUnit
from ..services.prediction_service import get_or_create_baseline_model, score_and_persist_prediction
from .celery_app import celery_app


@celery_app.task(name="prediction.run_ward_scores")
def run_ward_scores(admin_unit_id: str, horizon: str = "4w") -> dict:
    db = SessionLocal()
    try:
        admin_unit = db.get(AdminUnit, admin_unit_id)
        if admin_unit is None:
            return {"status": "error", "error": "admin_unit not found", "admin_unit_id": admin_unit_id}
        try:
            model = get_or_create_baseline_model(db)
            prediction = score_and_persist_prediction(db, admin_unit, model, horizon=horizon)
            db.commit()
        except ImportError:
            db.rollback()
            return {"status": "error", "error": "drishti_predict not installed"}
        return {"status": "completed", "admin_unit_id": admin_unit_id,
                "horizon": horizon, "risk_score": prediction.risk_score}
    finally:
        db.close()
