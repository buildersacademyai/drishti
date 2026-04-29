"""Download Sentinel-2 L2A imagery for a district via Google Earth Engine."""
import ee


def initialize():
    ee.Initialize()


def get_sentinel2_collection(
    bbox_wgs84: tuple,
    start_date: str,
    end_date: str,
    max_cloud_pct: float = 20.0,
) -> ee.ImageCollection:
    region = ee.Geometry.BBox(*bbox_wgs84)
    return (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(region)
        .filterDate(start_date, end_date)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", max_cloud_pct))
        .map(_mask_clouds)
    )


def _mask_clouds(image: ee.Image) -> ee.Image:
    scl = image.select("SCL")
    mask = scl.neq(8).And(scl.neq(9)).And(scl.neq(10)).And(scl.neq(11))
    return image.updateMask(mask)


def get_chitwan_bbox() -> tuple:
    return (83.9, 27.4, 84.8, 27.9)
