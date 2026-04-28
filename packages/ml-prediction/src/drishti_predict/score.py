import numpy as np
from pathlib import Path
import xgboost as xgb
from .features import build_feature_vector

MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "xgb_baseline.ubj"
_model: xgb.XGBClassifier | None = None


def _load_model() -> xgb.XGBClassifier:
    global _model
    if _model is None:
        _model = xgb.XGBClassifier()
        _model.load_model(str(MODEL_PATH))
    return _model


def score_ward(**feature_kwargs) -> dict:
    model = _load_model()
    feat = build_feature_vector(**feature_kwargs).reshape(1, -1)
    proba = float(model.predict_proba(feat)[0][1])
    return {"risk_score": proba, "uncertainty": float(min(proba, 1.0 - proba))}
