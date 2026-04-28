from drishti_api.models.geo import Tenant, AdminUnit
from drishti_api.models.satellite import SatelliteAcquisition, SatelliteDetection
from geoalchemy2.shape import from_shape
from shapely.geometry import box


def test_create_satellite_acquisition(client, db):
    tenant = Tenant(name="T", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-C",
                     name="Chitwan", population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()

    resp = client.post("/api/v1/satellite/acquisitions", json={
        "admin_unit_id": str(unit.id),
        "source": "sentinel-2",
        "cloud_cover_pct": 5.2,
        "storage_uri": "s3://drishti-imagery/sentinel2/chitwan.tif",
    })
    assert resp.status_code == 201
    assert resp.json()["source"] == "sentinel-2"


def test_list_satellite_detections_returns_geojson(client, db):
    tenant = Tenant(name="T2", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-D",
                     name="D", population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    acq = SatelliteAcquisition(tenant_id=tenant.id, admin_unit_id=unit.id,
                                source="sentinel-2", cloud_cover_pct=3.0)
    db.add(acq)
    db.flush()
    det = SatelliteDetection(
        tenant_id=tenant.id, acquisition_id=acq.id,
        geometry=from_shape(box(84.3, 27.6, 84.4, 27.7), srid=4326),
        detection_type="standing_water", confidence=0.85, area_sqm=1200.0,
    )
    db.add(det)
    db.flush()

    resp = client.get(f"/api/v1/satellite/detections?admin_unit_id={unit.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 1


def test_promote_detection(client, db):
    tenant = Tenant(name="T3", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-E2",
                     name="E2", population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    acq = SatelliteAcquisition(tenant_id=tenant.id, admin_unit_id=unit.id,
                                source="sentinel-2", cloud_cover_pct=0.0)
    db.add(acq)
    db.flush()
    det = SatelliteDetection(
        tenant_id=tenant.id, acquisition_id=acq.id,
        geometry=from_shape(box(84.3, 27.6, 84.4, 27.7), srid=4326),
        detection_type="standing_water", confidence=0.9,
    )
    db.add(det)
    db.flush()

    resp = client.post(f"/api/v1/satellite/detections/{det.id}/promote")
    assert resp.status_code == 200
    assert resp.json()["promoted"] == "promoted"


def test_create_mission(client, db):
    tenant = Tenant(name="T4", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-F",
                     name="F", population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()

    resp = client.post("/api/v1/missions", json={
        "mission_type": "verification",
        "admin_unit_id": str(unit.id),
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "planned"
    assert data["mission_type"] == "verification"


def test_dispatch_mission(client, db):
    tenant = Tenant(name="T5", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-G",
                     name="G", population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()

    create_resp = client.post("/api/v1/missions", json={
        "mission_type": "verification",
        "admin_unit_id": str(unit.id),
    })
    mission_id = create_resp.json()["id"]

    dispatch_resp = client.post(f"/api/v1/missions/{mission_id}/dispatch")
    assert dispatch_resp.status_code == 200
    assert dispatch_resp.json()["status"] == "in_progress"
