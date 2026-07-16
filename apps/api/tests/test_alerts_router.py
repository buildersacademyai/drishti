from datetime import datetime

from geoalchemy2.shape import from_shape
from shapely.geometry import box

from drishti_api.models.geo import AdminUnit, Tenant
from drishti_api.models.intervention import Alert
from drishti_api.models.ml import MLModel, Prediction
from drishti_api.models.satellite import SatelliteAcquisition, SatelliteDetection


def _make_alert_with_prediction(db, district_name="Chitwan", risk_score=0.82):
    tenant = Tenant(name="T", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-CH", name=district_name,
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    model = MLModel(name="xgb_baseline", version="1.0", status="active")
    db.add(model)
    db.flush()
    prediction = Prediction(model_id=model.id, admin_unit_id=unit.id,
                            target_date=datetime.utcnow(), target_horizon="4w",
                            risk_score=risk_score, uncertainty=0.1)
    db.add(prediction)
    db.flush()
    alert = Alert(prediction_id=prediction.id, severity="critical",
                  recipient_role="admin", channel="dashboard", sent_at=datetime.utcnow())
    db.add(alert)
    db.flush()
    return alert, unit


def test_list_alerts_includes_district_name_and_risk_score(client, db):
    _make_alert_with_prediction(db, district_name="Chitwan", risk_score=0.82)

    resp = client.get("/api/v1/alerts")
    assert resp.status_code == 200
    rows = resp.json()
    assert len(rows) == 1
    assert rows[0]["admin_unit_name"] == "Chitwan"
    assert rows[0]["risk_score"] == 0.82


def test_active_alerts_includes_district_name_and_risk_score(client, db):
    _make_alert_with_prediction(db, district_name="Bardiya", risk_score=0.91)

    resp = client.get("/api/v1/alerts/active")
    assert resp.status_code == 200
    rows = resp.json()
    assert len(rows) == 1
    assert rows[0]["admin_unit_name"] == "Bardiya"
    assert rows[0]["risk_score"] == 0.91


def test_list_alerts_without_prediction_has_null_district_fields(client, db):
    alert = Alert(severity="high", recipient_role="admin", channel="dashboard",
                 sent_at=datetime.utcnow())
    db.add(alert)
    db.flush()

    resp = client.get("/api/v1/alerts")
    assert resp.status_code == 200
    rows = resp.json()
    assert len(rows) == 1
    assert rows[0]["admin_unit_name"] is None
    assert rows[0]["risk_score"] is None


def test_list_alerts_includes_district_name_and_detection_area_for_satellite_alerts(client, db):
    tenant = Tenant(name="T4", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-KA", name="Kailali",
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    acquisition = SatelliteAcquisition(tenant_id=tenant.id, admin_unit_id=unit.id, source="sentinel-2")
    db.add(acquisition)
    db.flush()
    detection = SatelliteDetection(
        tenant_id=tenant.id, acquisition_id=acquisition.id,
        geometry=from_shape(box(84.3, 27.6, 84.4, 27.7), srid=4326),
        detection_type="standing_water", confidence=1.0, area_sqm=340.0,
    )
    db.add(detection)
    db.flush()
    alert = Alert(satellite_detection_id=detection.id, severity="high",
                  recipient_role="admin", channel="dashboard", sent_at=datetime.utcnow())
    db.add(alert)
    db.flush()

    resp = client.get("/api/v1/alerts")
    assert resp.status_code == 200
    rows = resp.json()
    assert len(rows) == 1
    assert rows[0]["admin_unit_name"] == "Kailali"
    assert rows[0]["detection_area_sqm"] == 340.0
    assert rows[0]["risk_score"] is None
