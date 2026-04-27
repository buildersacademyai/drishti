# Data Directory

This directory contains raw and processed data for the Drishti platform.

## Structure

- `drone_survey/` — drone imagery (not committed to git — upload to MinIO)
- `tiles/` — tiled survey imagery for annotation
- `yolo_dataset/` — annotated YOLOv8 training dataset
- `nanoshot_dataset/` — EfficientNet-B0 training dataset
- `chitwan_candidate_zones_*.geojson` — satellite NDWI output

## Note

Large binary files (imagery, trained models) are NOT committed to git.
Upload to MinIO: `docker compose exec minio mc cp <file> local/drishti-imagery/`
