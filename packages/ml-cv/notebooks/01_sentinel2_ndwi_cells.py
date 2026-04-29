# ---
# jupyter:
#   jupytext:
#     formats: py:percent
#     text_representation:
#       extension: .py
#       format_name: percent
# ---

# %% [markdown]
# # DRISHTI — Sentinel-2 NDWI Pipeline (Chitwan, Nepal)
# Detects new/seasonal standing water in Chitwan district.
# Output: GeoJSON candidate zones for drone validation.

# %%
import sys
sys.path.insert(0, "../src")
from drishti_cv.satellite.ee_ingest import initialize, get_sentinel2_collection, get_chitwan_bbox
from drishti_cv.satellite.ndwi import compute_ndwi, extract_water_mask, apply_jrc_exclusion, detect_new_water
from drishti_cv.satellite.export import water_mask_to_geojson, post_acquisition_to_api
import ee
import json

initialize()
print("Earth Engine initialized OK")

# %%
bbox = get_chitwan_bbox()
region = ee.Geometry.BBox(*bbox)

end_date = "2026-04-27"
start_date = "2026-04-20"
prev_start = "2026-04-13"
prev_end = "2026-04-20"

# %%
current_col = get_sentinel2_collection(bbox, start_date, end_date)
previous_col = get_sentinel2_collection(bbox, prev_start, prev_end)
print(f"Current images found: {current_col.size().getInfo()}")
print(f"Previous images found: {previous_col.size().getInfo()}")

# %%
current_img = current_col.median()
previous_img = previous_col.median()
current_ndwi = compute_ndwi(current_img)
previous_ndwi = compute_ndwi(previous_img)

current_water = apply_jrc_exclusion(extract_water_mask(current_ndwi, threshold=0.3))
previous_water = apply_jrc_exclusion(extract_water_mask(previous_ndwi, threshold=0.3))
new_water = detect_new_water(current_water, previous_water)

# %%
candidate_zones = water_mask_to_geojson(current_water, region, scale=30, max_features=20)
print(f"Candidate zones detected: {len(candidate_zones['features'])}")
for i, feat in enumerate(candidate_zones["features"][:5]):
    p = feat["properties"]
    print(f"  Zone {i+1}: area={p.get('area_sqm', '?'):.0f}m2, conf={p.get('confidence', '?'):.2f}")

# %%
out_path = "../data/chitwan_candidate_zones_2026-04-27.geojson"
with open(out_path, "w") as f:
    json.dump(candidate_zones, f, indent=2)
print(f"Saved: {out_path}")

# %%
# Register acquisition in backend API
# Replace CHITWAN_UUID with real UUID from seed data
# acq_id = post_acquisition_to_api("CHITWAN_UUID")
# print(f"Acquisition registered: {acq_id}")
print("Next: POST acquisition to API using post_acquisition_to_api(admin_unit_id)")
