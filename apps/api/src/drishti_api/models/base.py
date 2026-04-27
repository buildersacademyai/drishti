import uuid
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase

SEED_TENANT_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


class Base(DeclarativeBase):
    pass


class TenantMixin:
    tenant_id = Column(UUID(as_uuid=True), nullable=False, default=SEED_TENANT_ID)
