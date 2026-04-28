from .celery_app import celery_app


@celery_app.task(name="imagery.process_flight")
def process_flight_imagery(flight_id: str) -> dict:
    # MVP: CV inference called from notebook. Worker stub for Year-1 automation.
    return {"status": "queued", "flight_id": flight_id}
