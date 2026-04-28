from .celery_app import celery_app


@celery_app.task(name="prediction.run_ward_scores")
def run_ward_scores(admin_unit_id: str, horizon: str = "4w") -> dict:
    try:
        from drishti_predict.score import score_ward
        result = score_ward()
        return {"status": "completed", "admin_unit_id": admin_unit_id,
                "horizon": horizon, "risk_score": result["risk_score"]}
    except ImportError:
        return {"status": "error", "error": "drishti_predict not installed"}
