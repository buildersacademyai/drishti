FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
COPY src/ src/
COPY alembic/ alembic/
COPY alembic.ini .
RUN pip install -e ".[dev]"

CMD ["uvicorn", "drishti_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
