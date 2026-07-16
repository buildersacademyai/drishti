from datetime import datetime, timedelta

from geoalchemy2 import Geography
from sqlalchemy import cast, func, select
from sqlalchemy.orm import Session

from ..models.detection import Detection
from ..models.geo import AdminUnit
from ..models.satellite import SatelliteAcquisition, SatelliteDetection

LOOKBACK_DAYS = 90


def build_admin_unit_features(db: Session, admin_unit: AdminUnit) -> dict:
    """Real per-district numbers for the risk model, pulled from data already in the DB.

    Only overrides the features we have real data for; everything else
    (weather, rainfall, elevation, case history) falls back to the ML
    package's own defaults since no such data source exists yet.
    """
    cutoff = datetime.utcnow() - timedelta(days=LOOKBACK_DAYS)
    features: dict = {}

    if admin_unit.population:
        features["child_fraction"] = (admin_unit.child_pop_under_15 or 0) / admin_unit.population

    area_sqkm = None
    if admin_unit.geometry is not None:
        area_sqm = db.scalar(
            select(func.ST_Area(cast(AdminUnit.geometry, Geography)))
            .select_from(AdminUnit)
            .where(AdminUnit.id == admin_unit.id)
        )
        if area_sqm:
            area_sqkm = area_sqm / 1_000_000
            if admin_unit.population:
                features["population_density"] = admin_unit.population / area_sqkm

    features["water_body_area"] = db.scalar(
        select(func.coalesce(func.sum(SatelliteDetection.area_sqm), 0.0))
        .select_from(SatelliteDetection)
        .join(SatelliteAcquisition, SatelliteDetection.acquisition_id == SatelliteAcquisition.id)
        .where(SatelliteAcquisition.admin_unit_id == admin_unit.id)
        .where(SatelliteDetection.created_at >= cutoff)
    )

    habitat_count = 0
    if admin_unit.geometry is not None:
        habitat_count = db.scalar(
            select(func.count(Detection.id))
            .where(func.ST_Within(Detection.geometry, admin_unit.geometry))
            .where(Detection.detected_at >= cutoff)
        )
    features["habitat_density"] = (habitat_count / area_sqkm) if area_sqkm else 0.0

    return features
