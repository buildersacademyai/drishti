import uuid
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://drishti:drishti@localhost:5432/drishti"
    redis_url: str = "redis://localhost:6379/0"
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "drishti-imagery"
    seed_tenant_id: uuid.UUID = uuid.UUID("00000000-0000-0000-0000-000000000001")
    secret_key: str = "change-me-in-production-use-secrets-token-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    planetary_computer_api_key: str | None = None

    model_config = {"env_file": ".env"}


settings = Settings()
