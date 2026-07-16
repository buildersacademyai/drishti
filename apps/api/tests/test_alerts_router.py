from datetime import datetime

from drishti_api.models.geo import AdminUnit, Tenant
from drishti_api.models.intervention import Alert
from drishti_api.models.ml import MLModel, Prediction


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
