import uuid
from sqlalchemy import Column, String, Integer, BigInteger, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, backref
from geoalchemy2 import Geometry
from .base import Base, TenantMixin, SEED_TENANT_ID


class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    country_code = Column(String(3))
    settings_jsonb = Column(JSON, default=dict)


class AdminUnit(Base, TenantMixin):
    __tablename__ = "admin_units"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("admin_units.id"), nullable=True)
    level = Column(Integer, nullable=False)
    code = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    geometry = Column(Geometry("MULTIPOLYGON", srid=4326), nullable=True)
    population = Column(BigInteger, default=0)
    child_pop_under_15 = Column(BigInteger, default=0)
    children = relationship(
        "AdminUnit",
        backref=backref("parent", remote_side="AdminUnit.id"),
        foreign_keys=[parent_id],
    )


class Disease(Base):
    __tablename__ = "diseases"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    vector_species = Column(String(255))
    incubation_days = Column(Integer)
    climate_params_jsonb = Column(JSON, default=dict)


class Vertical(Base):
    __tablename__ = "verticals"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)


class DataSource(Base, TenantMixin):
    __tablename__ = "data_sources"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    config_jsonb = Column(JSON, default=dict)
