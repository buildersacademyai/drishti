import uuid as uuid_lib
from datetime import datetime, timedelta

from drishti_api.auth import create_access_token
from drishti_api.models.geo import Tenant, AdminUnit
from drishti_api.models.intervention import Alert, User
from drishti_api.models.satellite import SatelliteAcquisition, SatelliteDetection
from geoalchemy2.shape import from_shape
from shapely.geometry import box


def _auth_header(db, tenant):
    user = User(tenant_id=tenant.id, email=f"user-{uuid_lib.uuid4()}@test.com", role="admin")
    db.add(user)
    db.flush()
    token = create_access_token(subject=str(user.id), role="admin", tenant_id=str(tenant.id))
    return {"Authorization": f"Bearer {token}"}


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


def test_create_manual_water_source(client, db):
    tenant = Tenant(name="T-manual", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-MN", name="ManualDistrict",
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()

    resp = client.post("/api/v1/satellite/detections/manual", json={
        "admin_unit_id": str(unit.id),
        "lat": 27.65,
        "lng": 84.35,
        "notes": "near village well",
    }, headers=_auth_header(db, tenant))
    assert resp.status_code == 201
    body = resp.json()
    assert body["detection_type"] == "manual_pin"
    assert body["notes"] == "near village well"

    listed = client.get(f"/api/v1/satellite/detections?admin_unit_id={unit.id}")
    assert listed.status_code == 200
    features = listed.json()["features"]
    assert len(features) == 1
    assert features[0]["properties"]["detection_type"] == "manual_pin"

    alerts = db.query(Alert).filter(Alert.satellite_detection_id == body["id"]).count()
    assert alerts == 0


def test_create_manual_water_source_requires_auth(client, db):
    tenant = Tenant(name="T-manual-noauth", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-MN2", name="ManualDistrict2",
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()

    resp = client.post("/api/v1/satellite/detections/manual", json={
        "admin_unit_id": str(unit.id), "lat": 27.65, "lng": 84.35,
    })
    assert resp.status_code == 401


def test_create_manual_water_source_rejects_cross_tenant(client, db):
    owner_tenant = Tenant(name="T-owner", settings_jsonb={})
    attacker_tenant = Tenant(name="T-attacker", settings_jsonb={})
    db.add_all([owner_tenant, attacker_tenant])
    db.flush()
    unit = AdminUnit(tenant_id=owner_tenant.id, level=2, code="NP-OWN", name="OwnerDistrict",
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()

    resp = client.post("/api/v1/satellite/detections/manual", json={
        "admin_unit_id": str(unit.id), "lat": 27.65, "lng": 84.35,
    }, headers=_auth_header(db, attacker_tenant))
    assert resp.status_code == 404


def test_create_manual_water_source_rejects_oversized_notes(client, db):
    tenant = Tenant(name="T-oversized", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-OS", name="OversizedDistrict",
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()

    resp = client.post("/api/v1/satellite/detections/manual", json={
        "admin_unit_id": str(unit.id), "lat": 27.65, "lng": 84.35,
        "notes": "x" * 501,
    }, headers=_auth_header(db, tenant))
    assert resp.status_code == 422


def test_list_acquisitions_shows_positive_and_negative_scans(client, db):
    tenant = Tenant(name="T-scans", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-SC", name="ScanDistrict",
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()

    # Negative scan: acquisition with zero detections
    clean_acq = SatelliteAcquisition(tenant_id=tenant.id, admin_unit_id=unit.id,
                                     source="sentinel-2", cloud_cover_pct=8.0,
                                     acquired_at=datetime.utcnow() - timedelta(days=7))
    db.add(clean_acq)
    db.flush()

    # Positive scan: acquisition with a detection that triggered an alert (genuinely new site)
    hit_acq = SatelliteAcquisition(tenant_id=tenant.id, admin_unit_id=unit.id,
                                   source="sentinel-2", cloud_cover_pct=4.0,
                                   acquired_at=datetime.utcnow())
    db.add(hit_acq)
    db.flush()
    det = SatelliteDetection(
        tenant_id=tenant.id, acquisition_id=hit_acq.id,
        geometry=from_shape(box(84.3, 27.6, 84.4, 27.7), srid=4326),
        detection_type="standing_water", confidence=0.9, area_sqm=500.0,
    )
    db.add(det)
    db.flush()
    alert = Alert(satellite_detection_id=det.id, severity="high",
                  recipient_role="admin", channel="dashboard", sent_at=datetime.utcnow())
    db.add(alert)
    db.flush()

    resp = client.get(f"/api/v1/satellite/acquisitions?admin_unit_id={unit.id}")
    assert resp.status_code == 200
    rows = resp.json()
    assert len(rows) == 2

    by_id = {r["id"]: r for r in rows}
    clean_row = by_id[str(clean_acq.id)]
    hit_row = by_id[str(hit_acq.id)]

    assert clean_row["admin_unit_name"] == "ScanDistrict"
    assert clean_row["detection_count"] == 0
    assert clean_row["new_site_count"] == 0

    assert hit_row["detection_count"] == 1
    assert hit_row["new_site_count"] == 1

    # newest first
    assert rows[0]["id"] == str(hit_acq.id)


def test_get_acquisition_detail_includes_per_detection_new_site_flag(client, db):
    tenant = Tenant(name="T-scan-detail", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-SD", name="DetailDistrict",
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    acq = SatelliteAcquisition(tenant_id=tenant.id, admin_unit_id=unit.id,
                               source="sentinel-2", cloud_cover_pct=6.5)
    db.add(acq)
    db.flush()

    new_det = SatelliteDetection(
        tenant_id=tenant.id, acquisition_id=acq.id,
        geometry=from_shape(box(84.3, 27.6, 84.4, 27.7), srid=4326),
        detection_type="standing_water", confidence=0.92, area_sqm=500.0,
    )
    old_det = SatelliteDetection(
        tenant_id=tenant.id, acquisition_id=acq.id,
        geometry=from_shape(box(85.0, 28.0, 85.1, 28.1), srid=4326),
        detection_type="standing_water", confidence=0.7, area_sqm=200.0,
    )
    db.add_all([new_det, old_det])
    db.flush()
    alert = Alert(satellite_detection_id=new_det.id, severity="high",
                  recipient_role="admin", channel="dashboard", sent_at=datetime.utcnow())
    db.add(alert)
    db.flush()

    resp = client.get(f"/api/v1/satellite/acquisitions/{acq.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == str(acq.id)
    assert data["admin_unit_name"] == "DetailDistrict"
    assert data["cloud_cover_pct"] == 6.5
    assert len(data["detections"]) == 2

    by_id = {d["id"]: d for d in data["detections"]}
    assert by_id[str(new_det.id)]["is_new_site"] is True
    assert by_id[str(new_det.id)]["area_sqm"] == 500.0
    assert by_id[str(old_det.id)]["is_new_site"] is False


def test_get_acquisition_detail_404_for_unknown_id(client):
    import uuid as uuid_lib
    resp = client.get(f"/api/v1/satellite/acquisitions/{uuid_lib.uuid4()}")
    assert resp.status_code == 404


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
