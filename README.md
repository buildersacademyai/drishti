# Drishti — AI-Powered Climate & Emergency Response Platform

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![UNICEF Venture Fund](https://img.shields.io/badge/UNICEF%20Venture%20Fund-Applicant%202026-009edb)](https://unicefinnovationfund.org)

> **See the threat. Before it sees you.**

Drishti (दृष्टि — "vision" in Nepali/Sanskrit) is an open-source AI platform that combines satellite imagery, autonomous drones, and machine learning to detect climate and emergency threats — disease outbreaks, wildfires, floods, wildlife loss — across vulnerable regions. Same hardware stack, modular AI models per domain. First deployment: malaria and dengue vector surveillance in Nepal's Terai lowlands.

---

## The Problem

Climate change and emergencies are outpacing manual response. Warming temperatures, shifting weather patterns, and growing climate volatility are creating new risks faster than ground-based teams can track them.

Nepal's Terai districts, Drishti's first deployment, carry the highest malaria and dengue burden in the country. Surveillance is manual, reactive, and slow. By the time a case is reported, mosquito breeding has been underway for weeks. Dense forest, flooded plains, and dispersed villages make comprehensive ground surveillance impossible — and erratic monsoons create new stagnant water bodies faster than any field team can map.

---

## How Drishti Works

```
Satellite Scan → Drone Verification → AI Detection → Risk Score → Intervention Dispatch
```

1. **Satellite NDWI Analysis** — Multispectral imagery scans Terai terrain after rainfall, flagging stagnant water bodies as candidate breeding zones across entire districts
2. **Autonomous Drone Dispatch** — Flagged sites trigger drone deployment for low-altitude ground verification
3. **Computer Vision (YOLOv8)** — Onboard AI classifies larval presence with GPS-precise coordinates and confidence scores
4. **Risk Prediction** — Detections feed a district-level ML risk model scoring all 75 Nepal districts in real time
5. **Intervention Dashboard** — District health officers see live risk maps, create larvicide missions, and track outcomes — all from one platform

**Future scope:** Forest fire detection, wildlife corridor monitoring, flood damage assessment — same hardware stack, modular AI models.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Dashboard                  │
│         MapLibre · Real-time risk map · PWA          │
└──────────────────────┬──────────────────────────────┘
                       │ REST
┌──────────────────────▼──────────────────────────────┐
│                   FastAPI Backend                    │
│     PostGIS · SQLAlchemy · JWT Auth · Alembic        │
└────────┬─────────────┬──────────────┬───────────────┘
         │             │              │
    PostgreSQL       Redis          MinIO
    (PostGIS)      (Celery)      (Imagery)
         │
┌────────▼────────────────────────────────────────────┐
│              IoT + Drone Layer                       │
│         ESP32 Firmware · GPS Telemetry · OTA         │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), MapLibre GL JS, Tailwind CSS, PWA |
| Backend | FastAPI, SQLAlchemy 2, Alembic, PostGIS, Pydantic |
| Database | PostgreSQL 16 + PostGIS |
| Queue | Celery + Redis |
| Storage | MinIO (S3-compatible) |
| AI/CV | YOLOv8, NDWI satellite analysis |
| IoT | ESP32, GPS module, telemetry over WiFi/4G |
| Infrastructure | Docker Compose, designed for Kubernetes |

---

## Project Structure

```
drishti/
├── apps/
│   ├── api/          # FastAPI backend
│   │   ├── src/drishti_api/
│   │   │   ├── routers/      # alerts, auth, detections, drones, flights,
│   │   │   │                   interventions, missions, predictions, users
│   │   │   ├── models/       # SQLAlchemy models
│   │   │   └── main.py
│   │   └── alembic/          # DB migrations
│   └── web/          # Next.js app: public landing page (/) + admin dashboard (/dashboard)
│       ├── app/dashboard/    # Dashboard, map, drones, missions, alerts...
│       ├── components/       # MapView, DroneLoader, LogoIcon, Sidebar
│       └── lib/              # API client, auth
├── iot/              # ESP32 drone firmware
├── infra/            # Docker Compose
└── packages/         # Shared ML packages
```

---

## Getting Started

### Prerequisites
- Docker Desktop
- Node.js 18+
- Python 3.11+

### 1. Start infrastructure

```bash
cd infra
docker compose up postgres redis minio -d
```

### 2. Run database migrations

```bash
cd apps/api
pip install -e .
PYTHONPATH=src alembic upgrade head
```

### 3. Create admin user

```bash
# Generate password hash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'yourpassword', bcrypt.gensalt()).decode())"

# Insert via psql
docker exec drishti-postgres psql -U drishti -d drishti -c "
INSERT INTO users (id, tenant_id, email, name, role, password_hash, created_at)
VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001',
'admin@drishti.io', 'Admin', 'admin', '<hash>', NOW());"
```

### 4. Start API

```bash
cd apps/api
PYTHONPATH=src uvicorn drishti_api.main:app --reload --port 8000
```

### 5. Start dashboard

```bash
cd apps/web
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Admin login → JWT token |
| GET | `/api/v1/drones` | List drone fleet |
| POST | `/api/v1/drones` | Register drone |
| PATCH | `/api/v1/drones/:id` | Update status/battery/coords |
| GET | `/api/v1/missions` | List missions |
| GET | `/api/v1/detections` | List detections |
| GET | `/api/v1/predictions` | District risk scores |
| GET | `/api/v1/alerts` | Active alerts |
| GET | `/api/v1/interventions` | Intervention log |
| GET | `/api/v1/users` | User management |

Full API docs at `http://localhost:8000/docs` (Swagger UI)

---

## Pilot Plan

**Phase 1 (Months 1–2):** Drone flights over Chitwan and Bardiya districts — capture and annotate larval site imagery for YOLOv8 training

**Phase 2 (Months 3–4):** Train CV model, target >85% detection accuracy, validate with district health officers

**Phase 3 (Months 5–6):** Live pilot across 3 high-burden Terai districts

**Phase 4 (Months 7–12):** Measure intervention response time (<48hrs target), scale to 8 districts, begin dengue-specific model training

---

## Team

| Name | Role | Focus |
|---|---|---|
| Binaya Tripathi | Founder | Vision · Strategy · Partnerships |
| Dipak Sharma | Project Lead | Backend · ML · Infrastructure · Drone Systems |
| Rishav Subedi | Drone Developer | UAV Hardware · Flight Firmware · Autonomous Systems |

Built by [BuildersAcademy.ai](https://buildersacademy.ai), with field partnership from Nepal MoHP (public health/VBD surveillance) and an agricultural drone operator (UAV operations, Chitwan).

---

## License

Apache 2.0 — see [LICENSE](LICENSE)

---

*Built for Nepal. Designed to scale.*
