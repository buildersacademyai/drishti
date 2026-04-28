import numpy as np
from pathlib import Path
import xgboost as xgb
from .features import build_feature_vector

MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "xgb_baseline.ubj"


def generate_synthetic_data(n_samples: int = 2000):
    rng = np.random.default_rng(42)
    X, y = [], []
    for _ in range(n_samples):
        temp = float(rng.uniform(20, 38))
        humidity = float(rng.uniform(55, 95))
        water = float(rng.uniform(0, 5))
        habitats = float(rng.uniform(0, 20))
        rainfall = float(rng.uniform(0, 200))
        cases_lag = int(rng.poisson(max(0.0, (temp - 24) * 0.5 + habitats * 0.3)))
        feat = build_feature_vector(
            water_body_area=water, habitat_density=habitats,
            treated_sites_30d=int(rng.integers(0, 5)),
            temp_mean=temp, temp_max=temp + float(rng.uniform(2, 6)),
            humidity_mean=humidity, rainfall_cumulative_mm=rainfall,
            rainfall_lag1w_mm=rainfall / 4.0,
            population_density=float(rng.uniform(100, 5000)),
            child_fraction=float(rng.uniform(0.25, 0.45)),
            elevation_m=float(rng.uniform(70, 2500)),
            case_count_lag1w=cases_lag,
            case_count_lag2w=max(0, cases_lag - int(rng.integers(-2, 4))),
        )
        X.append(feat)
        y.append(1 if cases_lag > 5 and temp > 28 and habitats > 8 else 0)
    return np.array(X), np.array(y)


def train_and_save(model_path: str | None = None) -> xgb.XGBClassifier:
    path = Path(model_path) if model_path else MODEL_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    X, y = generate_synthetic_data()
    split = int(len(X) * 0.8)
    model = xgb.XGBClassifier(
        n_estimators=100, max_depth=4, learning_rate=0.1,
        subsample=0.8, colsample_bytree=0.8,
        eval_metric="logloss", random_state=42,
    )
    model.fit(X[:split], y[:split], eval_set=[(X[split:], y[split:])], verbose=False)
    model.save_model(str(path))
    print(f"Model saved to {path}")
    return model


if __name__ == "__main__":
    train_and_save()
