import numpy as np

FEATURE_NAMES = [
    "water_body_area_sqkm", "habitat_density_per_sqkm", "habitat_density_adjusted",
    "temp_mean_c", "temp_max_c", "growing_degree_days",
    "humidity_mean_pct", "rainfall_4w_mm", "rainfall_lag1w_mm",
    "population_density", "child_fraction", "elevation_m",
    "cases_lag1w", "cases_lag2w", "cases_2w_trend",
]


def build_feature_vector(
    water_body_area: float = 0.0,
    habitat_density: float = 0.0,
    treated_sites_30d: int = 0,
    temp_mean: float = 25.0,
    temp_max: float = 30.0,
    humidity_mean: float = 70.0,
    rainfall_cumulative_mm: float = 50.0,
    rainfall_lag1w_mm: float = 12.0,
    population_density: float = 500.0,
    child_fraction: float = 0.35,
    elevation_m: float = 300.0,
    case_count_lag1w: int = 0,
    case_count_lag2w: int = 0,
) -> np.ndarray:
    return np.array([
        water_body_area,
        habitat_density,
        max(0.0, habitat_density - treated_sites_30d * 0.1),
        temp_mean,
        temp_max,
        max(0.0, temp_mean - 18.0),
        humidity_mean,
        rainfall_cumulative_mm,
        rainfall_lag1w_mm,
        population_density,
        child_fraction,
        elevation_m,
        float(case_count_lag1w),
        float(case_count_lag2w),
        float(case_count_lag1w + case_count_lag2w),
    ], dtype=np.float32)
