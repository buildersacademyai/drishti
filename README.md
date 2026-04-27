# Drishti Platform

An open-source, AI-driven climate-health early warning platform that combines
drone-captured larval habitat mapping, IoT environmental sensing, and predictive ML
to forecast vector-borne disease outbreaks 4–6 weeks in advance.

## Quick Start

```bash
cp apps/api/.env.example apps/api/.env
docker compose up -d
# API: http://localhost:8000/docs
# MinIO: http://localhost:9001
```

## Architecture

See [docs/architecture.md](docs/architecture.md).

## License

Apache 2.0
