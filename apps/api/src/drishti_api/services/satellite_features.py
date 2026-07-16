import numpy as np
import planetary_computer
import pyproj
import pystac_client
import rasterio
from geoalchemy2.shape import to_shape
from rasterio.features import shapes as rio_shapes
from rasterio.mask import mask as rio_mask
from scipy import ndimage
from shapely.geometry import mapping, shape as shapely_shape
from shapely.ops import transform as shapely_transform

from ..models.geo import AdminUnit

STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
COLLECTION = "sentinel-2-l2a"
NDWI_THRESHOLD = 0.0
MAX_CLOUD_COVER_PCT = 20
# 8-connected structuring element for the morphological cleanup below.
_MORPH_STRUCTURE = np.ones((3, 3), dtype=bool)


def fetch_water_polygons_for_district(admin_unit: AdminUnit, min_area_sqm: float = 200.0) -> list[dict]:
    """Real Sentinel-2 NDWI water-body extraction via Microsoft Planetary Computer.

    Not exercised by the automated test suite (network + live imagery) —
    verified manually. Business logic that IS unit tested lives in
    satellite_ingest_service.py, called with this as an injectable fetch_fn.
    """
    if admin_unit.geometry is None:
        return []

    district_geom_4326 = to_shape(admin_unit.geometry)

    catalog = pystac_client.Client.open(STAC_URL, modifier=planetary_computer.sign_inplace)
    search = catalog.search(
        collections=[COLLECTION],
        bbox=district_geom_4326.bounds,
        query={"eo:cloud_cover": {"lt": MAX_CLOUD_COVER_PCT}},
        sortby=[{"field": "properties.datetime", "direction": "desc"}],
        max_items=1,
    )
    items = list(search.items())
    if not items:
        return []
    item = items[0]

    green_href = item.assets["B03"].href
    nir_href = item.assets["B08"].href

    with rasterio.open(green_href) as green_src:
        to_scene_crs = pyproj.Transformer.from_crs(
            "EPSG:4326", green_src.crs, always_xy=True
        ).transform
        district_geom_scene_crs = shapely_transform(to_scene_crs, district_geom_4326)
        green, out_transform = rio_mask(
            green_src, [mapping(district_geom_scene_crs)], crop=True, filled=True, nodata=0
        )
        scene_crs = green_src.crs

    with rasterio.open(nir_href) as nir_src:
        nir, _ = rio_mask(
            nir_src, [mapping(district_geom_scene_crs)], crop=True, filled=True, nodata=0
        )

    green_band = green[0].astype("float32")
    nir_band = nir[0].astype("float32")
    denom = green_band + nir_band
    ndwi = np.where(denom == 0, 0.0, (green_band - nir_band) / np.where(denom == 0, 1, denom))
    water_mask = ndwi > NDWI_THRESHOLD

    # Raw per-pixel thresholding fragments a single contiguous river into
    # hundreds of speckle-noise polygons (mixed pixels, shadow, turbidity
    # break up what's really one water body). Opening removes isolated
    # single-pixel noise; closing re-merges the gaps that fragment a real,
    # continuous water body into disconnected pieces.
    water_mask = ndimage.binary_opening(water_mask, structure=_MORPH_STRUCTURE)
    water_mask = ndimage.binary_closing(water_mask, structure=_MORPH_STRUCTURE, iterations=2)

    to_4326 = pyproj.Transformer.from_crs(scene_crs, "EPSG:4326", always_xy=True).transform
    geod = pyproj.Geod(ellps="WGS84")

    polygons = []
    for geom_dict, value in rio_shapes(water_mask.astype("uint8"), mask=water_mask, transform=out_transform):
        if value != 1:
            continue
        poly_4326 = shapely_transform(to_4326, shapely_shape(geom_dict))
        area_sqm, _ = geod.geometry_area_perimeter(poly_4326)
        area_sqm = abs(area_sqm)
        if area_sqm < min_area_sqm:
            continue
        polygons.append({"geometry": poly_4326, "area_sqm": area_sqm})

    return polygons
