from celery import Celery
from ..config import settings

celery_app = Celery(
    "drishti",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "drishti_api.workers.satellite_ingest",
        "drishti_api.workers.imagery_process",
        "drishti_api.workers.prediction_run",
    ],
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
