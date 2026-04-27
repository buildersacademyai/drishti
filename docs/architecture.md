# Drishti — System Architecture

## Three-Tier Verify → Validate → Execute

### Tier 1: Wide-Area Screening (Satellite)
- Sentinel-2 L2A imagery (ESA Copernicus, free, 10m resolution, 5-day revisit)
- NDWI water index + week-over-week change detection
- Output: GeoJSON of candidate zones → `satellite_detections` table
- Processing: Google Earth Engine notebook (weekly, automated via Celery in production)

### Tier 2: High-Resolution Verification (Drone)
- Drone flies to satellite-flagged zones only (70–80% fewer flights than blanket coverage)
- Survey pass (30m, 5–10cm GSD): YOLOv8 detects standing water / containers
- Nano-shot descent (2–5m): EfficientNet-B0 confirms larvae or rejects false positive
- Output: `detections` records with `detection_type=larvae_confirmed`

### Tier 3: Targeted Intervention (Same Drone, Payload Swap)
- Confirmed sites trigger intervention mission
- Camera payload → larvicide spray payload (<5 min swap)
- Precision spray at exact confirmed coordinates
- Output: `interventions` records — full georeferenced audit trail

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | FastAPI 0.111+, Python 3.11 |
| Task queue | Celery 5 + Redis 7 |
| Database | PostgreSQL 15 + PostGIS 3.3 |
| Blob storage | MinIO (local) / AWS S3 (prod) |
| CV — survey | YOLOv8 (Ultralytics) |
| CV — nano-shot | EfficientNet-B0 (PyTorch) |
| Prediction | XGBoost |
| Frontend | Next.js 14, MapLibre GL, TailwindCSS |
| IoT | ESP32 + DHT22 + LoRaWAN (described, not built in MVP) |

## Data Model Key Design Decisions

- `tenant_id` on every table — multi-tenant from day one, single seed tenant for MVP
- `admin_units` recursive hierarchy — works for any country's admin structure
- `diseases` + `verticals` as data rows — add malaria without code changes
- `detections` generic table — same infrastructure for vector, ag, aquaculture verticals
- `data_sources` abstraction — swap drone platform without rewriting ingestion

See full schema: project.md §2.3
