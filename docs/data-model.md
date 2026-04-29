# Drishti — Data Model

## Design Principles

The schema is built for a 3-year trajectory, not just MVP. Four forward-compatibility decisions drive every table:

1. **`tenant_id` everywhere** — Multi-tenant from day one. MVP runs as a single seed tenant; adding a second organization requires no migration.
2. **Recursive `admin_units`** — `level` + `parent_id` encodes any country's administrative hierarchy (Nepal ward → municipality → district → province; or India village → block → district → state). Adding Bangladesh requires zero schema changes.
3. **`diseases` and `verticals` as rows** — Dengue is a data row, not a hardcoded enum. Adding malaria or Japanese Encephalitis is `INSERT INTO diseases ...`, not a code change.
4. **Generic `detections`** — One table serves larval habitat detection today, crop stress or livestock counting tomorrow. `detection_type` and `vertical_id` provide the specificity.

---

## Entity Relationship Overview

```
tenants
  └── admin_units (recursive, country-agnostic hierarchy)
  └── missions ──────────────────── triggered_by → satellite_detections
        └── flights ────────────── payload_type: camera | spray | multispectral
              └── imagery
                    └── detections ─── detection_type: larvae_confirmed → interventions
  └── satellite_acquisitions
        └── satellite_detections ── feeds mission planning
  └── sensors
        └── sensor_readings
  └── predictions ──────────────── fuses satellite + drone + IoT + history
  └── alerts ────────────────────── generated from predictions
  └── users
  └── audit_log
```

---

## Core Tables

### `tenants`

```sql
id              uuid  PK
name            text
country_code    char(2)   -- ISO 3166
created_at      timestamptz
settings_jsonb  jsonb     -- tenant-specific config
```

Single row for MVP. No application code needs to change when a second tenant is onboarded — `tenant_id` filters are already in place on every query.

---

### `admin_units`

```sql
id                 uuid  PK
tenant_id          uuid  FK → tenants
parent_id          uuid  FK → admin_units (nullable, null = root)
level              int   -- 0=country 1=province 2=district 3=municipality 4=ward
code               text  -- official government code (LGU, GAUL, etc.)
name               text
geometry           geometry(MultiPolygon, 4326)
population         int
child_pop_under_15 int
```

Recursive `parent_id` makes this work for any country's administrative structure. Spatial index on `geometry` for efficient containment queries.

---

### `diseases`

```sql
id                  uuid  PK
code                text  UNIQUE  -- 'dengue', 'malaria', 'je', 'leptospirosis'
name                text
vector_species      text[]        -- ['Aedes aegypti', 'Aedes albopictus']
incubation_days     int
climate_params_jsonb jsonb        -- temp range, humidity threshold, etc.
```

Seeded: dengue, malaria, japanese_encephalitis, leptospirosis. The prediction pipeline takes `disease_id` as a parameter — training a new disease model is data + training, not code.

---

### `verticals`

```sql
id    uuid  PK
code  text  UNIQUE  -- 'vector_health', 'agriculture', 'aquaculture', 'livestock'
name  text
```

Seeded: vector_health (MVP). Agriculture uses the same drone + CV infrastructure — it becomes a second vertical row when funded.

---

### Satellite Tier

```sql
-- satellite_acquisitions
id              uuid  PK
tenant_id       uuid  FK
admin_unit_id   uuid  FK → admin_units
source          text  -- 'sentinel2_ee', 'sentinel2_local', 'planet'
acquired_at     timestamptz
cloud_cover_pct numeric(5,2)
storage_uri     text  -- MinIO/S3 path to raw tile

-- satellite_detections
id              uuid  PK
tenant_id       uuid  FK
acquisition_id  uuid  FK → satellite_acquisitions
geometry        geometry(Polygon, 4326)
detection_type  text  -- 'standing_water', 'water_increase', 'vegetation_change'
confidence      numeric(4,3)  -- 0.000–1.000
area_sqm        numeric
ndwi_score      numeric(6,4)
created_at      timestamptz
```

Each `satellite_detection` is a candidate zone that feeds mission planning. Spatial index on `geometry` enables fast proximity queries when planning drone routes.

---

### Mission + Drone Tier

```sql
-- missions
id             uuid  PK
tenant_id      uuid  FK
mission_type   text  -- 'verification', 'intervention', 'routine_survey'
status         text  -- 'planned', 'in_progress', 'completed', 'cancelled'
admin_unit_id  uuid  FK → admin_units
triggered_by   uuid  -- FK → satellite_detections (nullable)
planned_at     timestamptz
executed_at    timestamptz

-- flights
id              uuid  PK
tenant_id       uuid  FK
mission_id      uuid  FK → missions
data_source_id  uuid  FK → data_sources
started_at      timestamptz
ended_at        timestamptz
operator_id     uuid  FK → users (nullable)
mission_path_jsonb jsonb  -- GeoJSON LineString of waypoints
payload_type    text   -- 'camera', 'spray', 'multispectral'

-- imagery
id           uuid  PK
tenant_id    uuid  FK
flight_id    uuid  FK → flights
captured_at  timestamptz
storage_uri  text
metadata_jsonb jsonb   -- altitude, GSD, camera settings
geom_bbox    geometry(Polygon, 4326)

-- detections
id              uuid  PK
tenant_id       uuid  FK
imagery_id      uuid  FK → imagery (nullable — may come from satellite)
mission_id      uuid  FK → missions (nullable)
vertical_id     uuid  FK → verticals
detection_type  text  -- 'larvae_confirmed', 'habitat_confirmed', 'false_positive', 'water_body'
geometry        geometry(Point, 4326)
confidence      numeric(4,3)
model_id        uuid  FK → models (nullable)
detected_at     timestamptz
```

`detection_type = 'larvae_confirmed'` is the trigger condition for Stage 3 intervention. The `POST /api/v1/detections/{id}/trigger-intervention` endpoint enforces this with a 422 guard.

---

### IoT + Climate

```sql
-- sensor_types
id           uuid  PK
code         text  -- 'env_dht22', 'rain_gauge', 'water_quality'
name         text
schema_jsonb jsonb  -- expected payload fields

-- sensors
id              uuid  PK
tenant_id       uuid  FK
sensor_type_id  uuid  FK → sensor_types
admin_unit_id   uuid  FK → admin_units
location        geometry(Point, 4326)
installed_at    timestamptz
last_seen_at    timestamptz
metadata_jsonb  jsonb

-- sensor_readings
id            uuid  PK
sensor_id     uuid  FK → sensors
timestamp     timestamptz  INDEXED
payload_jsonb jsonb         -- full payload, all fields
temp_c        numeric(5,2)  -- denormalized for fast queries
humidity_pct  numeric(5,2)
rainfall_mm   numeric(6,2)
```

`payload_jsonb` holds the full sensor payload. New sensor types (water quality probe, soil moisture) are config-only — no migration needed. Frequently queried fields (`temp_c`, `humidity_pct`, `rainfall_mm`) are denormalized for query performance.

---

### ML + Predictions

```sql
-- models
id                uuid  PK
tenant_id         uuid  FK
name              text
version           text
vertical_id       uuid  FK → verticals
target_disease_id uuid  FK → diseases (nullable)
training_data_ref text  -- DVC ref or S3 URI
metrics_jsonb     jsonb  -- AUC, mAP, Brier score, etc.
status            text  -- 'training', 'validated', 'in_production', 'deprecated'

-- predictions
id              uuid  PK
tenant_id       uuid  FK
model_id        uuid  FK → models
admin_unit_id   uuid  FK → admin_units
target_date     date
target_horizon  int   -- days ahead (e.g. 28 = 4-week horizon)
risk_score      numeric(4,3)  -- 0.000–1.000
uncertainty     numeric(4,3)
generated_at    timestamptz
```

Multiple model versions can coexist in `models` — `status` controls which is active. This enables side-by-side A/B testing and gradual rollout without code branches.

---

### Interventions

```sql
id                uuid  PK
tenant_id         uuid  FK
detection_id      uuid  FK → detections
mission_id        uuid  FK → missions
intervention_type text  -- 'larvicide_spray', 'source_reduction', 'education_campaign'
target_geometry   geometry(Point, 4326)
executed_at       timestamptz
larvicide_litres  numeric(6,3)  -- null for non-spray types
operator_notes    text
```

Every intervention record traces back through `detection_id → imagery_id → flight_id → mission_id → satellite_detection_id`. This produces a complete georeferenced audit trail from satellite pixel to spray event — auditable by MoHP, EDCD, or UNICEF evaluators.

---

### Alerts + Users

```sql
-- alerts
id               uuid  PK
tenant_id        uuid  FK
prediction_id    uuid  FK → predictions
severity         text  -- 'low', 'medium', 'high', 'critical'
recipient_role   text  -- 'fchv', 'district_health_officer', 'edcd'
channel          text  -- 'push', 'sms', 'dashboard'
sent_at          timestamptz
acknowledged_at  timestamptz  -- null = still active

-- users
id             uuid  PK
tenant_id      uuid  FK
role           text  -- 'admin', 'health_officer', 'fchv', 'operator'
admin_unit_id  uuid  FK → admin_units
locale         text  -- 'en', 'ne'
phone          text
email          text
created_at     timestamptz

-- audit_log
id           uuid  PK
tenant_id    uuid  FK
actor_id     uuid  FK → users (nullable — system actions allowed)
action       text  -- 'intervention.created', 'mission.dispatched', etc.
entity_type  text
entity_id    uuid
timestamp    timestamptz
payload_jsonb jsonb  -- full before/after for sensitive changes
```

`alerts.acknowledged_at = NULL` is the "active alerts" query pattern used by `GET /api/v1/alerts/active`. No soft-delete — alerts are append-only for audit integrity.

---

## Key Indexes

```sql
-- Geospatial
CREATE INDEX ON satellite_detections USING GIST(geometry);
CREATE INDEX ON admin_units USING GIST(geometry);
CREATE INDEX ON sensors USING GIST(location);
CREATE INDEX ON detections USING GIST(geometry);

-- Tenant-scoped lookups (all hot paths)
CREATE INDEX ON detections(tenant_id, detected_at);
CREATE INDEX ON satellite_detections(tenant_id, created_at);
CREATE INDEX ON predictions(tenant_id, admin_unit_id, generated_at);
CREATE INDEX ON sensor_readings(sensor_id, timestamp);
CREATE INDEX ON alerts(tenant_id, acknowledged_at) WHERE acknowledged_at IS NULL;
```

---

## Multi-Tenancy Pattern

All queries use `tenant_id` as the first filter. Application code enforces this via `TenantMixin` in SQLAlchemy models — the `tenant_id` default is injected from settings at the session level. Cross-tenant data access is impossible through the API layer; direct DB access for analytics uses row-level security or separate read replicas per tenant.

---

## Migration Strategy

Alembic manages all schema changes. Migrations live in `apps/api/alembic/versions/`. Rules:
- No destructive migrations without a rollback path
- New columns must be `nullable` or have a `server_default` — zero-downtime deploys
- Enum changes go through `text` columns with application-level validation, not Postgres `ENUM` types (easier to extend)
