# Drishti — Climate-Health Vector Surveillance Platform

[![CI](https://github.com/drishti-platform/drishti/actions/workflows/ci.yml/badge.svg)](https://github.com/drishti-platform/drishti/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![UNICEF Venture Fund](https://img.shields.io/badge/UNICEF%20Venture%20Fund-Applicant%202026-009edb)](https://unicefinnovationfund.org)

**See it from space. Confirm it from the sky. Stop it before it spreads.**

An open-source, AI-driven platform that combines satellite screening and drone verification to predict and prevent vector-borne disease outbreaks — starting with dengue in Nepal's climate-vulnerable mid-hill districts.

---

## The Problem

Climate change is pushing dengue into Nepal's mid-hill districts — communities that were mosquito-free a decade ago. Dengue cases have grown **10× since 2010**. Children under 15 account for 40% of severe cases. Current surveillance is paper-based, reactive, and operates with a **2–4 week lag**.

## The Solution: Verify → Validate → Execute

```
SATELLITE (weekly, free, 100% coverage)
    → flags candidate water bodies at 10m resolution
    → 70–80% fewer drone flights vs. blanket coverage

DRONE (autonomous, targets flagged zones only)
    → survey pass (30m): YOLOv8 detects standing water
    → nano-shot descent (2–5m): EfficientNet confirms larvae
    → 48-hour verification cycle

INTERVENTION (same drone, payload swap)
    → precision larvicide at confirmed coordinates
    → 60–80% less chemical use vs. blanket spraying
    → 72-hour flag-to-treatment vs. 2–4 weeks manually
```

---

## Repository Structure

```
drishti/
├── apps/
│   ├── api/            # FastAPI backend — REST + Celery workers
│   ├── web/            # Next.js 14 dashboard — MapLibre map, PWA, en/ne i18n
│   └── landing/        # Marketing landing page (static export → Vercel)
├── packages/
│   ├── ml-cv/          # CV pipeline — satellite NDWI, YOLOv8 survey, EfficientNet nano-shot
│   └── ml-prediction/  # XGBoost outbreak risk prediction
├── iot/                # ESP32 firmware for temperature/humidity/rainfall sensors
├── infra/              # Docker Compose (dev + prod), deployment scripts
├── docs/               # Architecture, data model, deployment, ethics
└── scripts/            # Dev setup, seed data
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + SQLAlchemy 2 + GeoAlchemy2 |
| Task queue | Celery 5 + Redis 7 |
| Database | PostgreSQL 15 + PostGIS 3.3 |
| Blob storage | MinIO (self-hosted) / AWS S3 |
| CV — survey | YOLOv8 (Ultralytics) |
| CV — nano-shot | EfficientNet-B0 (PyTorch) |
| Prediction | XGBoost + scikit-learn |
| Satellite | Sentinel-2 via Google Earth Engine |
| Frontend | Next.js 14, MapLibre GL, TailwindCSS, Framer Motion |
| i18n | next-intl (English + Nepali) |
| IoT | ESP32 + DHT22 + LoRaWAN |
| License | Apache 2.0 |

---

## Quick Start (local dev)

**Requirements:** Docker Desktop, Python 3.11+, Node 20+

```bash
# 1. Clone and configure
git clone https://github.com/drishti-platform/drishti.git
cd drishti
cp apps/api/.env.example apps/api/.env

# 2. Start infrastructure (PostGIS, Redis, MinIO)
docker compose up -d postgres redis minio

# 3. Backend API
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head
python scripts/seed-demo-data.py   # creates demo tenant + ward data
uvicorn drishti_api.main:app --reload
# → http://localhost:8000/docs

# 4. Celery workers (new terminal)
celery -A drishti_api.workers.celery_app worker --loglevel=info

# 5. Dashboard (new terminal)
cd apps/web && npm install && npm run dev
# → http://localhost:3001/map

# 6. Landing page (optional)
cd apps/landing && npm install && npm run dev
# → http://localhost:3000
```

Full infrastructure stack (all services):
```bash
docker compose up -d   # postgres, redis, minio, api, worker
```

---

## Running the ML Pipeline

**Satellite NDWI pipeline** (requires Google Earth Engine auth):
```bash
cd packages/ml-cv
pip install -e "."
python -c "
from drishti_cv.satellite.ndwi import compute_ndwi
from drishti_cv.satellite.export import water_mask_to_geojson
# see notebooks/01_sentinel2_ndwi_cells.py
"
```

**Outbreak prediction model** (runs without external data — synthetic training):
```bash
cd packages/ml-prediction
pip install -e "."
python -c "
from drishti_predict.train import train_and_save
train_and_save()   # → models/xgb_baseline.ubj
"
```

**Demo notebook chain** (satellite → drone → predict):
```bash
cd packages/ml-cv
pip install jupytext jupyter
jupytext --to ipynb notebooks/04_demo_chain_cells.py
jupyter notebook notebooks/04_demo_chain_cells.ipynb
```

---

## Tests

```bash
cd apps/api
pytest tests/ -v
```

CI runs on every push and PR — see [.github/workflows/ci.yml](.github/workflows/ci.yml).

---

## Documentation

| Document | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Three-tier system design, tech stack, key decisions |
| [docs/data-model.md](docs/data-model.md) | Database schema, entity relationships, multi-tenancy |
| [docs/deployment.md](docs/deployment.md) | Self-hosted deployment guide (Docker, VPS) |
| [docs/ethics-and-data-governance.md](docs/ethics-and-data-governance.md) | Privacy, consent, data sovereignty principles |
| [project.md](project.md) | Full development specification (internal) |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All contributions must:
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)
- Pass CI (lint + tests)
- Be Apache 2.0 compatible

---

## License

Apache License 2.0 — see [LICENSE](LICENSE).

Data collected during pilot deployments is subject to Nepal's Privacy Act 2018. See [ethics-and-data-governance.md](docs/ethics-and-data-governance.md).

---

*Built in Kathmandu. Designed to run anywhere. No cloud vendor required.*
