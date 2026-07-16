from shapely.geometry import box

from drishti_api.models.geo import AdminUnit, Tenant
from drishti_api.models.intervention import Alert
from drishti_api.models.satellite import SatelliteAcquisition, SatelliteDetection
from drishti_api.services.satellite_ingest_service import (
    find_new_sites,
    maybe_create_detection_alerts,
    persist_acquisition_and_detections,
    run_ingestion_for_all_admin_units,
)

SITE_A = box(84.30, 27.60, 84.31, 27.61)  # a small polygon, "site A"
SITE_A_SAME = box(84.301, 27.601, 84.309, 27.609)  # overlaps SITE_A
SITE_B = box(85.00, 28.00, 85.01, 28.01)  # far away, non-overlapping, "site B"


def _make_tenant_and_unit(db, name="X"):
    tenant = Tenant(name=name, settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code=f"NP-{name}", name=name,
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    return tenant, unit


def _polygons(*geoms, area=1000.0):
    return [{"geometry": g, "area_sqm": area} for g in geoms]


def test_persist_acquisition_and_detections_writes_rows(db):
    tenant, unit = _make_tenant_and_unit(db)

    acquisition, detections = persist_acquisition_and_detections(
        db, unit, _polygons(SITE_A, SITE_B, area=250.0)
    )

    assert acquisition.admin_unit_id == unit.id
    assert len(detections) == 2
    assert all(d.area_sqm == 250.0 for d in detections)
    assert db.query(SatelliteDetection).filter(
        SatelliteDetection.acquisition_id == acquisition.id
    ).count() == 2


def test_find_new_sites_returns_empty_on_first_ever_run(db):
    tenant, unit = _make_tenant_and_unit(db)
    acquisition, detections = persist_acquisition_and_detections(db, unit, _polygons(SITE_A))

    new_sites = find_new_sites(db, unit.id, acquisition.id, detections)

    assert new_sites == []


def test_find_new_sites_excludes_overlapping_with_previous(db):
    tenant, unit = _make_tenant_and_unit(db)
    prev_acq, _ = persist_acquisition_and_detections(db, unit, _polygons(SITE_A))
    curr_acq, curr_detections = persist_acquisition_and_detections(db, unit, _polygons(SITE_A_SAME))

    new_sites = find_new_sites(db, unit.id, curr_acq.id, curr_detections)

    assert new_sites == []


def test_find_new_sites_includes_non_overlapping_as_new(db):
    tenant, unit = _make_tenant_and_unit(db)
    prev_acq, _ = persist_acquisition_and_detections(db, unit, _polygons(SITE_A))
    curr_acq, curr_detections = persist_acquisition_and_detections(db, unit, _polygons(SITE_A_SAME, SITE_B))

    new_sites = find_new_sites(db, unit.id, curr_acq.id, curr_detections)

    assert len(new_sites) == 1
    assert new_sites[0].area_sqm == curr_detections[
        next(i for i, d in enumerate(curr_detections) if d.id == new_sites[0].id)
    ].area_sqm


def test_maybe_create_detection_alerts_creates_one_per_site(db):
    tenant, unit = _make_tenant_and_unit(db)
    acquisition, detections = persist_acquisition_and_detections(db, unit, _polygons(SITE_A, SITE_B))

    alerts = maybe_create_detection_alerts(db, detections)

    assert len(alerts) == 2
    assert all(a.severity == "high" for a in alerts)
    assert all(a.recipient_role == "admin" for a in alerts)
    assert all(a.channel == "dashboard" for a in alerts)
    assert {a.satellite_detection_id for a in alerts} == {d.id for d in detections}


def test_run_ingestion_persists_but_does_not_alert_on_first_run(db):
    tenant, unit = _make_tenant_and_unit(db, name="F1")

    results = run_ingestion_for_all_admin_units(
        db, tenant_id=tenant.id, fetch_fn=lambda admin_unit, min_area_sqm: _polygons(SITE_A)
    )

    assert len(results) == 1
    assert results[0]["new_site_count"] == 0
    assert results[0]["detection_count"] == 1
    assert db.query(SatelliteDetection).filter(
        SatelliteDetection.acquisition_id == results[0]["acquisition_id"]
    ).count() == 1


def test_run_ingestion_alerts_only_on_genuinely_new_site_on_second_run(db):
    tenant, unit = _make_tenant_and_unit(db, name="F2")

    run_ingestion_for_all_admin_units(
        db, tenant_id=tenant.id, fetch_fn=lambda admin_unit, min_area_sqm: _polygons(SITE_A)
    )
    results = run_ingestion_for_all_admin_units(
        db, tenant_id=tenant.id,
        fetch_fn=lambda admin_unit, min_area_sqm: _polygons(SITE_A_SAME, SITE_B),
    )

    assert results[0]["new_site_count"] == 1
    alerts = db.query(Alert).join(
        SatelliteDetection, Alert.satellite_detection_id == SatelliteDetection.id
    ).all()
    assert len(alerts) == 1


def test_run_ingestion_scoped_by_tenant(db):
    tenant1, unit1 = _make_tenant_and_unit(db, name="G1")
    tenant2, unit2 = _make_tenant_and_unit(db, name="G2")

    results = run_ingestion_for_all_admin_units(
        db, tenant_id=tenant1.id, fetch_fn=lambda admin_unit, min_area_sqm: _polygons(SITE_A)
    )

    assert len(results) == 1
    assert results[0]["admin_unit_id"] == unit1.id
