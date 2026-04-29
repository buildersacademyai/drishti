"""Export satellite detections as GeoJSON and POST to backend API."""
import json
import requests


def water_mask_to_geojson(
    water_mask,
    region,
    scale: int = 30,
    max_features: int = 20,
) -> dict:
    """Vectorize EE water mask to GeoJSON FeatureCollection."""
    vectors = water_mask.reduceToVectors(
        geometry=region,
        scale=scale,
        geometryType="polygon",
        eightConnected=False,
        maxPixels=1e8,
        bestEffort=True,
    ).limit(max_features, "count", False)

    fc = vectors.getInfo()
    for feature in fc.get("features", []):
        props = feature.get("properties", {})
        area_sqm = props.get("count", 1) * scale * scale
        props["area_sqm"] = area_sqm
        props["confidence"] = min(1.0, area_sqm / 10000.0)
        props["detection_type"] = "standing_water"
        feature["properties"] = props
    return fc


def post_acquisition_to_api(admin_unit_id: str, api_base: str = "http://localhost:8000") -> str:
    """Register a satellite acquisition and return its ID."""
    resp = requests.post(f"{api_base}/api/v1/satellite/acquisitions", json={
        "admin_unit_id": admin_unit_id,
        "source": "sentinel-2",
        "cloud_cover_pct": 5.0,
        "storage_uri": "ee://COPERNICUS/S2_SR_HARMONIZED/chitwan",
    })
    resp.raise_for_status()
    return resp.json()["id"]
