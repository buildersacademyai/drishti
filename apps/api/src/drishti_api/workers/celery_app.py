from celery import Celery
from celery.schedules import crontab
from ..config import settings

celery_app = Celery(
    "drishti",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "drishti_api.workers.satellite_ingest",
        "drishti_api.workers.imagery_process",
        "drishti_api.workers.prediction_run",
        "drishti_api.workers.scan_run",
    ],
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "daily-risk-scan": {
            "task": "scan.run_daily_risk_scan",
            "schedule": crontab(hour=2, minute=0),
        },
        "weekly-satellite-ingest": {
            "task": "satellite.ingest_district",
            "schedule": crontab(hour=1, minute=0, day_of_week=1),
        },
    },
)
