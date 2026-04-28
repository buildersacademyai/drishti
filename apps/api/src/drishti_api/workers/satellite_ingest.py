from .celery_app import celery_app


@celery_app.task(name="satellite.ingest_district")
def ingest_district(admin_unit_id: str, source: str = "sentinel-2") -> dict:
    # MVP: EE notebook triggers this manually. Worker stub for Year-1 automation.
    return {"status": "queued", "admin_unit_id": admin_unit_id}
