# Contributing to Drishti

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes following our coding standards
4. Submit a pull request

## Development Setup

```bash
cp apps/api/.env.example apps/api/.env
docker compose -f infra/docker-compose.yml up -d
cd apps/api && pip install -e ".[dev]"
pytest apps/api/tests/
```

## Code Standards

- Python: ruff + mypy (CI enforced)
- TypeScript: eslint (CI enforced)
- Tests required for all backend changes
- Apache 2.0 license for all contributions
