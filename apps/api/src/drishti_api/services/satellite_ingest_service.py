from datetime import datetime
from typing import Callable

from geoalchemy2.shape import from_shape
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models.geo import AdminUnit
from ..models.intervention import Alert
from ..models.satellite import SatelliteAcquisition, SatelliteDetection

DEFAULT_MIN_AREA_SQM = 50.0

FetchFn = Callable[..., list[dict]]


def persist_acquisition_and_detections(
    db: Session,
    admin_unit: AdminUnit,
    polygons: list[dict],
    source: str = "sentinel-2",
    cloud_cover_pct: float = 0.0,
) -> tuple[SatelliteAcquisition, list[SatelliteDetection]]:
    acquisition = SatelliteAcquisition(
        admin_unit_id=admin_unit.id, source=source, cloud_cover_pct=cloud_cover_pct
    )
    db.add(acquisition)
    db.flush()

    detections = []
    for polygon in polygons:
        detection = SatelliteDetection(
            acquisition_id=acquisition.id,
            geometry=from_shape(polygon["geometry"], srid=4326),
            detection_type="standing_water",
            confidence=polygon.get("confidence", 1.0),
            area_sqm=polygon["area_sqm"],
        )
        db.add(detection)
        detections.append(detection)
    db.flush()
    return acquisition, detections


def find_new_sites(
    db: Session,
    admin_unit_id,
    current_acquisition_id,
    current_detections: list[SatelliteDetection],
) -> list[SatelliteDetection]:
    previous_acquisition = (
        db.query(SatelliteAcquisition)
        .filter(SatelliteAcquisition.admin_unit_id == admin_unit_id)
        .filter(SatelliteAcquisition.id != current_acquisition_id)
        .order_by(SatelliteAcquisition.acquired_at.desc())
        .first()
    )
    if previous_acquisition is None:
        return []

    new_sites = []
    for detection in current_detections:
        overlaps = (
            db.query(SatelliteDetection)
            .filter(SatelliteDetection.acquisition_id == previous_acquisition.id)
            .filter(func.ST_Intersects(SatelliteDetection.geometry, detection.geometry))
            .first()
        )
        if overlaps is None:
            new_sites.append(detection)
    return new_sites


def maybe_create_detection_alerts(db: Session, new_sites: list[SatelliteDetection]) -> list[Alert]:
    alerts = []
    for site in new_sites:
        alert = Alert(
            satellite_detection_id=site.id,
            severity="high",
            recipient_role="admin",
            channel="dashboard",
            sent_at=datetime.utcnow(),
        )
        db.add(alert)
        alerts.append(alert)
    db.flush()
    return alerts


def run_ingestion_for_all_admin_units(
    db: Session,
    tenant_id=None,
    fetch_fn: FetchFn | None = None,
    min_area_sqm: float = DEFAULT_MIN_AREA_SQM,
) -> list[dict]:
    if fetch_fn is None:
        from .satellite_features import fetch_water_polygons_for_district

        fetch_fn = fetch_water_polygons_for_district

    query = db.query(AdminUnit)
    if tenant_id is not None:
        query = query.filter(AdminUnit.tenant_id == tenant_id)

    results = []
    for admin_unit in query.all():
        polygons = fetch_fn(admin_unit, min_area_sqm=min_area_sqm)
        acquisition, detections = persist_acquisition_and_detections(db, admin_unit, polygons)
        new_sites = find_new_sites(db, admin_unit.id, acquisition.id, detections)
        alerts = maybe_create_detection_alerts(db, new_sites)
        results.append({
            "admin_unit_id": admin_unit.id,
            "acquisition_id": acquisition.id,
            "detection_count": len(detections),
            "new_site_count": len(new_sites),
            "alert_ids": [a.id for a in alerts],
        })
    return results
