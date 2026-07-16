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
        # Automated NDWI water-body scanning (satellite.ingest_district) is
        # intentionally NOT scheduled here. Persistent false positives
        # (river fragments, oxbows, wide slow bends geometrically compact
        # enough to pass the shape filter but still part of the active
        # river, not stagnant breeding water) made automated results
        # unreliable. Manual pinning (POST /satellite/detections/manual)
        # is the primary path for adding water sources for now. The task
        # and its NDWI/compactness pipeline are left in place — callable
        # directly (see workers/satellite_ingest.py) if automated
        # scanning is revisited later, e.g. after a better filter or a
        # permanent-water-body mask.
    },
)
