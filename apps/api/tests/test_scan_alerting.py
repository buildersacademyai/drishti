from drishti_api.models.geo import AdminUnit, Tenant
from drishti_api.models.intervention import Alert
from drishti_api.models.ml import MLModel, Prediction
from drishti_api.services.prediction_service import (
    get_or_create_baseline_model,
    is_high_risk,
    run_scan_for_all_admin_units,
    score_and_persist_prediction,
)


def _make_tenant_and_unit(db, name="X", population=0, child_pop_under_15=0):
    tenant = Tenant(name=name, settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code=f"NP-{name}", name=name,
                     population=population, child_pop_under_15=child_pop_under_15)
    db.add(unit)
    db.flush()
    return tenant, unit


def test_is_high_risk_threshold():
    assert is_high_risk(0.75) is True
    assert is_high_risk(0.9) is True
    assert is_high_risk(0.74) is False
    assert is_high_risk(0.0) is False


def test_get_or_create_baseline_model_is_idempotent(db):
    model1 = get_or_create_baseline_model(db)
    model2 = get_or_create_baseline_model(db)
    assert model1.id == model2.id
    assert db.query(MLModel).count() == 1


def test_score_and_persist_prediction_writes_row(db):
    tenant, unit = _make_tenant_and_unit(db)
    model = get_or_create_baseline_model(db)

    prediction = score_and_persist_prediction(
        db, unit, model, score_fn=lambda **kw: {"risk_score": 0.42, "uncertainty": 0.1}
    )

    assert prediction.id is not None
    assert prediction.admin_unit_id == unit.id
    assert prediction.risk_score == 0.42
    assert prediction.uncertainty == 0.1
    assert db.query(Prediction).filter(Prediction.id == prediction.id).count() == 1


def test_scan_creates_alert_on_first_high_risk_crossing(db):
    tenant, unit = _make_tenant_and_unit(db, name="A")

    run_scan_for_all_admin_units(db, tenant_id=tenant.id,
                                 score_fn=lambda **kw: {"risk_score": 0.9, "uncertainty": 0.05})

    alerts = db.query(Alert).join(Prediction).filter(Prediction.admin_unit_id == unit.id).all()
    assert len(alerts) == 1
    assert alerts[0].severity == "critical"
    assert alerts[0].recipient_role == "admin"
    assert alerts[0].channel == "dashboard"
    prediction = db.query(Prediction).filter(Prediction.admin_unit_id == unit.id).one()
    assert alerts[0].prediction_id == prediction.id


def test_scan_does_not_alert_below_threshold(db):
    tenant, unit = _make_tenant_and_unit(db, name="B")

    run_scan_for_all_admin_units(db, tenant_id=tenant.id,
                                 score_fn=lambda **kw: {"risk_score": 0.5, "uncertainty": 0.1})

    predictions = db.query(Prediction).filter(Prediction.admin_unit_id == unit.id).all()
    assert len(predictions) == 1
    alerts = db.query(Alert).filter(Alert.prediction_id.in_([p.id for p in predictions])).all()
    assert len(alerts) == 0


def test_scan_does_not_realert_while_still_high(db):
    tenant, unit = _make_tenant_and_unit(db, name="C")

    high = lambda **kw: {"risk_score": 0.9, "uncertainty": 0.05}
    run_scan_for_all_admin_units(db, tenant_id=tenant.id, score_fn=high)
    run_scan_for_all_admin_units(db, tenant_id=tenant.id, score_fn=high)
    run_scan_for_all_admin_units(db, tenant_id=tenant.id, score_fn=high)

    predictions = db.query(Prediction).filter(Prediction.admin_unit_id == unit.id).all()
    alerts = db.query(Alert).filter(Alert.prediction_id.in_([p.id for p in predictions])).all()
    assert len(predictions) == 3
    assert len(alerts) == 1


def test_scan_realerts_after_dropping_then_rising(db):
    tenant, unit = _make_tenant_and_unit(db, name="D")

    run_scan_for_all_admin_units(db, tenant_id=tenant.id,
                                 score_fn=lambda **kw: {"risk_score": 0.9, "uncertainty": 0.05})
    run_scan_for_all_admin_units(db, tenant_id=tenant.id,
                                 score_fn=lambda **kw: {"risk_score": 0.3, "uncertainty": 0.1})
    run_scan_for_all_admin_units(db, tenant_id=tenant.id,
                                 score_fn=lambda **kw: {"risk_score": 0.9, "uncertainty": 0.05})

    predictions = db.query(Prediction).filter(Prediction.admin_unit_id == unit.id).all()
    alerts = db.query(Alert).filter(Alert.prediction_id.in_([p.id for p in predictions])).all()
    assert len(predictions) == 3
    assert len(alerts) == 2


def test_scan_covers_every_admin_unit_independently(db):
    tenant1, unit1 = _make_tenant_and_unit(db, name="E1")
    tenant2, unit2 = _make_tenant_and_unit(db, name="E2")

    results1 = run_scan_for_all_admin_units(
        db, tenant_id=tenant1.id, score_fn=lambda **kw: {"risk_score": 0.9, "uncertainty": 0.05}
    )
    results2 = run_scan_for_all_admin_units(
        db, tenant_id=tenant2.id, score_fn=lambda **kw: {"risk_score": 0.9, "uncertainty": 0.05}
    )

    assert len(results1) == 1
    assert len(results2) == 1
    assert results1[0]["admin_unit_id"] == unit1.id
    assert results2[0]["admin_unit_id"] == unit2.id
