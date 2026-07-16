from datetime import datetime, timedelta

from geoalchemy2 import Geography
from geoalchemy2.shape import from_shape
from shapely.geometry import box, Point
from sqlalchemy import cast, func, select

from drishti_api.models.detection import Detection
from drishti_api.models.drone import Mission
from drishti_api.models.geo import AdminUnit, Tenant
from drishti_api.models.satellite import SatelliteAcquisition, SatelliteDetection
from drishti_api.services.risk_features import build_admin_unit_features


def _st_area_sqkm(db, geometry_col, admin_unit_id):
    area_sqm = db.scalar(
        select(func.ST_Area(cast(geometry_col, Geography)))
        .select_from(AdminUnit)
        .where(AdminUnit.id == admin_unit_id)
    )
    return area_sqm / 1_000_000


def _make_tenant_and_unit(db, population=1_000_000, child_pop_under_15=400_000, geometry=None):
    tenant = Tenant(name="T", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(
        tenant_id=tenant.id, level=2, code="NP-X", name="X",
        population=population, child_pop_under_15=child_pop_under_15,
        geometry=geometry,
    )
    db.add(unit)
    db.flush()
    return tenant, unit


def test_child_fraction_computed_from_population_and_child_pop(db):
    tenant, unit = _make_tenant_and_unit(db, population=1_000_000, child_pop_under_15=400_000)
    features = build_admin_unit_features(db, unit)
    assert features["child_fraction"] == 0.4


def test_water_body_area_sums_recent_satellite_detections_for_district(db):
    tenant, unit = _make_tenant_and_unit(db)
    other_tenant, other_unit = _make_tenant_and_unit(db)

    acq = SatelliteAcquisition(tenant_id=tenant.id, admin_unit_id=unit.id, source="sentinel-2")
    db.add(acq)
    db.flush()

    recent = datetime.utcnow() - timedelta(days=10)
    stale = datetime.utcnow() - timedelta(days=200)
    poly = from_shape(box(84.3, 27.6, 84.4, 27.7), srid=4326)

    db.add_all([
        SatelliteDetection(tenant_id=tenant.id, acquisition_id=acq.id, geometry=poly,
                           detection_type="standing_water", confidence=0.9,
                           area_sqm=1000.0, created_at=recent),
        SatelliteDetection(tenant_id=tenant.id, acquisition_id=acq.id, geometry=poly,
                           detection_type="standing_water", confidence=0.9,
                           area_sqm=2000.0, created_at=recent),
        SatelliteDetection(tenant_id=tenant.id, acquisition_id=acq.id, geometry=poly,
                           detection_type="standing_water", confidence=0.9,
                           area_sqm=5000.0, created_at=stale),
    ])
    db.flush()

    other_acq = SatelliteAcquisition(tenant_id=other_tenant.id, admin_unit_id=other_unit.id, source="sentinel-2")
    db.add(other_acq)
    db.flush()
    db.add(SatelliteDetection(tenant_id=other_tenant.id, acquisition_id=other_acq.id, geometry=poly,
                              detection_type="standing_water", confidence=0.9,
                              area_sqm=9999.0, created_at=recent))
    db.flush()

    features = build_admin_unit_features(db, unit)
    assert features["water_body_area"] == 3000.0


def test_population_density_uses_admin_unit_geometry_area(db):
    geom = from_shape(box(84.0, 27.0, 84.1, 27.1), srid=4326)
    tenant, unit = _make_tenant_and_unit(db, population=1_000_000, geometry=geom)
    expected_density = 1_000_000 / _st_area_sqkm(db, AdminUnit.geometry, unit.id)

    features = build_admin_unit_features(db, unit)
    assert features["population_density"] == expected_density


def test_features_fall_back_to_defaults_when_geometry_missing(db):
    tenant, unit = _make_tenant_and_unit(db, population=1_000_000, geometry=None)
    features = build_admin_unit_features(db, unit)
    assert "population_density" not in features
    assert features["habitat_density"] == 0.0


def test_habitat_density_counts_confirmed_detections_within_district_geometry_recent_window(db):
    geom = from_shape(box(84.0, 27.0, 84.1, 27.1), srid=4326)
    tenant, unit = _make_tenant_and_unit(db, geometry=geom)
    mission = Mission(tenant_id=tenant.id, mission_type="verification",
                      status="completed", admin_unit_id=unit.id)
    db.add(mission)
    db.flush()

    recent = datetime.utcnow() - timedelta(days=10)
    stale = datetime.utcnow() - timedelta(days=200)
    inside = from_shape(Point(84.05, 27.05), srid=4326)
    outside = from_shape(Point(85.0, 28.0), srid=4326)

    db.add_all([
        Detection(tenant_id=tenant.id, mission_id=mission.id, detection_type="larvae_confirmed",
                  confidence=0.9, geometry=inside, detected_at=recent),
        Detection(tenant_id=tenant.id, mission_id=mission.id, detection_type="larvae_confirmed",
                  confidence=0.9, geometry=inside, detected_at=recent),
        Detection(tenant_id=tenant.id, mission_id=mission.id, detection_type="larvae_confirmed",
                  confidence=0.9, geometry=outside, detected_at=recent),
        Detection(tenant_id=tenant.id, mission_id=mission.id, detection_type="larvae_confirmed",
                  confidence=0.9, geometry=inside, detected_at=stale),
    ])
    db.flush()

    expected_density = 2 / _st_area_sqkm(db, AdminUnit.geometry, unit.id)
    features = build_admin_unit_features(db, unit)
    assert features["habitat_density"] == expected_density
