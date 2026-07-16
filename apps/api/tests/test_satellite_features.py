import math

from drishti_api.services.satellite_features import polsby_popper_compactness


def test_perfect_circle_has_compactness_of_one():
    r = 50.0
    area = math.pi * r ** 2
    perimeter = 2 * math.pi * r
    assert polsby_popper_compactness(area, perimeter) == 1.0


def test_thin_elongated_shape_has_low_compactness():
    # a 1000m x 10m sliver — river-channel-like
    area = 1000.0 * 10.0
    perimeter = 2 * (1000.0 + 10.0)
    assert polsby_popper_compactness(area, perimeter) < 0.15


def test_compact_pond_like_shape_passes_typical_threshold():
    # roughly square pond
    side = 40.0
    area = side * side
    perimeter = 4 * side
    assert polsby_popper_compactness(area, perimeter) > 0.5


def test_zero_perimeter_returns_zero_not_error():
    assert polsby_popper_compactness(100.0, 0.0) == 0.0
