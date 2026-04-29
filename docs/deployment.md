# Drishti — Deployment Guide

## Overview

Drishti is designed to run fully self-hosted with no external cloud dependencies in operation. The only external calls are:
- Sentinel-2 imagery acquisition via Google Earth Engine (can be replaced with local `sen2cor`)
- Optional Sentry error reporting (disabled by default)

---

## Development (local)

```bash
# Prerequisites: Docker Desktop, Python 3.11+, Node 20+

git clone https://github.com/drishti-platform/drishti.git
cd drishti

# Start infrastructure
docker compose up -d postgres redis minio

# Backend
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env          # edit as needed
alembic upgrade head
python scripts/seed-demo-data.py
uvicorn drishti_api.main:app --reload --port 8000

# Celery worker (new terminal, same .venv)
celery -A drishti_api.workers.celery_app worker --loglevel=info

# Dashboard
cd apps/web && npm install && npm run dev   # → :3001/map

# Landing page
cd apps/landing && npm install && npm run dev  # → :3000
```

---

## Production (VPS — recommended for Nepal deployment)

### Infrastructure requirements

| Component | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 50 GB SSD | 200 GB SSD (imagery grows) |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Network | 10 Mbps | 50 Mbps |

Providers with Nepal/Asia data centers: DigitalOcean (Singapore), Hetzner (Singapore), Linode (Singapore), or any VPS with data center in India/Nepal for data sovereignty.

---

### Step 1: Server setup

```bash
# As root
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin git ufw nginx certbot python3-certbot-nginx

# Enable firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable

# Add deploy user
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
```

---

### Step 2: Clone and configure

```bash
su - deploy
git clone https://github.com/drishti-platform/drishti.git /home/deploy/drishti
cd /home/deploy/drishti

# Copy and edit prod env
cp apps/api/.env.example apps/api/.env.prod
```

**Required env vars for production** (`apps/api/.env.prod`):

```env
DATABASE_URL=postgresql+psycopg2://drishti:<strong-password>@postgres:5432/drishti
REDIS_URL=redis://redis:6379/0
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=<generate-strong-key>
MINIO_SECRET_KEY=<generate-strong-secret>
MINIO_BUCKET=drishti
SECRET_KEY=<generate-with: python -c "import secrets; print(secrets.token_hex(32))">
SEED_TENANT_ID=<generate-with: python -c "import uuid; print(uuid.uuid4())">
ENVIRONMENT=production
```

---

### Step 3: Start services

```bash
cd /home/deploy/drishti

# Start all services
docker compose -f infra/docker-compose.prod.yml up -d

# Apply migrations
docker compose -f infra/docker-compose.prod.yml exec api alembic upgrade head

# Seed initial data
docker compose -f infra/docker-compose.prod.yml exec api python scripts/seed-demo-data.py
```

---

### Step 4: Nginx + TLS

```nginx
# /etc/nginx/sites-available/drishti-api
server {
    server_name api.yourdomain.org;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/drishti-api /etc/nginx/sites-enabled/
certbot --nginx -d api.yourdomain.org
nginx -t && systemctl reload nginx
```

---

### Step 5: Frontend deployment

**Dashboard (apps/web):**
```bash
cd apps/web
npm ci
NEXT_PUBLIC_API_URL=https://api.yourdomain.org npm run build
# Deploy .next/ to Vercel, or serve with `npm start` behind nginx
```

**Landing page (apps/landing) — static export:**
```bash
cd apps/landing
npm ci && npm run build
# out/ directory → deploy to Vercel, Netlify, or nginx static serve
```

For Vercel deployment (recommended for landing page):
```bash
# Install Vercel CLI
npm i -g vercel

cd apps/landing
vercel --prod   # one-time setup + deploy
```

---

### Step 6: Health check

```bash
curl https://api.yourdomain.org/health
# {"status": "ok", "db": "connected", "redis": "connected"}
```

---

## Updating

```bash
cd /home/deploy/drishti
git pull origin main

# Apply any new migrations
docker compose -f infra/docker-compose.prod.yml exec api alembic upgrade head

# Restart API and workers
docker compose -f infra/docker-compose.prod.yml restart api worker
```

Zero-downtime update strategy: use `docker compose up -d --no-deps --build api` to rebuild and restart only the API container without stopping the database.

---

## Data Sovereignty (in-country deployment)

To keep all data in-country:

1. Use a VPS with a data center in Nepal or India.
2. Set `MINIO_ENDPOINT` to a locally-hosted MinIO instance (not AWS S3).
3. For satellite imagery: replace Google Earth Engine calls with local `sen2cor` processing:
   ```bash
   # See packages/ml-cv/src/drishti_cv/satellite/local_ingest.py (Year 1 build)
   ```
4. Disable Sentry (set `SENTRY_DSN=` empty in .env).
5. Configure Redis with a password and TLS in production.

---

## Backups

```bash
# Daily PostgreSQL backup (run via cron)
docker compose exec postgres pg_dump -U drishti drishti | gzip > /backups/drishti-$(date +%Y%m%d).sql.gz

# Keep 30 days
find /backups -name "drishti-*.sql.gz" -mtime +30 -delete
```

Recommended: replicate backups to a second storage location (different server or region).

---

## Monitoring

- **Logs:** `docker compose logs -f api worker`
- **Metrics:** Prometheus + Grafana (optional, see `infra/monitoring/`)
- **Uptime:** UptimeRobot free tier monitors `/health` endpoint

---

## Scaling

For Year 1 pilot (1–2 districts, ~50 concurrent users):

The single-VPS Docker Compose setup is sufficient. Celery workers scale horizontally — add worker replicas:

```bash
docker compose up -d --scale worker=3
```

For Year 2+ (multiple countries, 1000+ users): Kubernetes manifests will be added to `infra/k8s/`.

---

## Troubleshooting

**PostGIS extension missing:**
```bash
docker compose exec postgres psql -U drishti -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

**Alembic "can't locate revision":**
```bash
docker compose exec api alembic stamp head   # if schema exists but history table doesn't
```

**MinIO bucket not found:**
```bash
docker compose exec minio mc alias set local http://localhost:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
docker compose exec minio mc mb local/drishti
```
