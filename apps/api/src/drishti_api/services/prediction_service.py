from datetime import datetime
from typing import Callable

from sqlalchemy.orm import Session

from ..models.geo import AdminUnit
from ..models.intervention import Alert
from ..models.ml import MLModel, Prediction
from .risk_features import build_admin_unit_features

HIGH_RISK_THRESHOLD = 0.75
BASELINE_MODEL_NAME = "xgb_baseline"
BASELINE_MODEL_VERSION = "1.0"

ScoreFn = Callable[..., dict]


def is_high_risk(risk_score: float) -> bool:
    return risk_score >= HIGH_RISK_THRESHOLD


def get_or_create_baseline_model(db: Session) -> MLModel:
    model = (
        db.query(MLModel)
        .filter(MLModel.name == BASELINE_MODEL_NAME, MLModel.version == BASELINE_MODEL_VERSION)
        .first()
    )
    if model is None:
        model = MLModel(name=BASELINE_MODEL_NAME, version=BASELINE_MODEL_VERSION, status="active")
        db.add(model)
        db.flush()
    return model


def _default_score_fn(**feature_kwargs) -> dict:
    from drishti_predict.score import score_ward

    return score_ward(**feature_kwargs)


def score_and_persist_prediction(
    db: Session,
    admin_unit: AdminUnit,
    model: MLModel,
    score_fn: ScoreFn | None = None,
    horizon: str = "4w",
) -> Prediction:
    score_fn = score_fn or _default_score_fn
    features = build_admin_unit_features(db, admin_unit)
    result = score_fn(**features)

    prediction = Prediction(
        model_id=model.id,
        admin_unit_id=admin_unit.id,
        target_date=datetime.utcnow(),
        target_horizon=horizon,
        risk_score=result["risk_score"],
        uncertainty=result.get("uncertainty"),
    )
    db.add(prediction)
    db.flush()
    return prediction


def _previous_prediction_was_high_risk(db: Session, admin_unit_id, before_generated_at) -> bool:
    previous = (
        db.query(Prediction)
        .filter(Prediction.admin_unit_id == admin_unit_id)
        .filter(Prediction.generated_at < before_generated_at)
        .order_by(Prediction.generated_at.desc())
        .first()
    )
    return previous is not None and is_high_risk(previous.risk_score)


def maybe_create_alert(db: Session, prediction: Prediction) -> Alert | None:
    if not is_high_risk(prediction.risk_score):
        return None
    if _previous_prediction_was_high_risk(db, prediction.admin_unit_id, prediction.generated_at):
        return None

    alert = Alert(
        prediction_id=prediction.id,
        severity="critical",
        recipient_role="admin",
        channel="dashboard",
        sent_at=datetime.utcnow(),
    )
    db.add(alert)
    db.flush()
    return alert


def run_scan_for_all_admin_units(
    db: Session, tenant_id=None, score_fn: ScoreFn | None = None
) -> list[dict]:
    model = get_or_create_baseline_model(db)
    query = db.query(AdminUnit)
    if tenant_id is not None:
        query = query.filter(AdminUnit.tenant_id == tenant_id)
    results = []
    for admin_unit in query.all():
        prediction = score_and_persist_prediction(db, admin_unit, model, score_fn=score_fn)
        alert = maybe_create_alert(db, prediction)
        results.append({
            "admin_unit_id": admin_unit.id,
            "prediction_id": prediction.id,
            "risk_score": prediction.risk_score,
            "alert_id": alert.id if alert else None,
        })
    return results
