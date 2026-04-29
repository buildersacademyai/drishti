"""NDWI computation and water body extraction."""
import ee


def compute_ndwi(image: ee.Image) -> ee.Image:
    return image.normalizedDifference(["B3", "B8"]).rename("NDWI")


def compute_ndvi(image: ee.Image) -> ee.Image:
    return image.normalizedDifference(["B8", "B4"]).rename("NDVI")


def extract_water_mask(ndwi_image: ee.Image, threshold: float = 0.3) -> ee.Image:
    return ndwi_image.gt(threshold).rename("water_mask")


def apply_jrc_exclusion(water_mask: ee.Image) -> ee.Image:
    """Exclude permanent water (>70% historical occurrence) — keep only seasonal water."""
    jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence")
    permanent = jrc.gt(70)
    return water_mask.And(permanent.Not())


def detect_new_water(current_mask: ee.Image, previous_mask: ee.Image) -> ee.Image:
    return current_mask.And(previous_mask.Not()).rename("new_water")
