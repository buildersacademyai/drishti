import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from .base import Base, TenantMixin


class SensorType(Base):
    __tablename__ = "sensor_types"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    schema_jsonb = Column(JSON, default=dict)


class Sensor(Base, TenantMixin):
    __tablename__ = "sensors"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sensor_type_id = Column(UUID(as_uuid=True), ForeignKey("sensor_types.id"), nullable=False)
    admin_unit_id = Column(UUID(as_uuid=True), ForeignKey("admin_units.id"), nullable=False)
    location = Column(Geometry("POINT", srid=4326), nullable=True)
    installed_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, nullable=True)
    metadata_jsonb = Column(JSON, default=dict)


class SensorReading(Base):
    __tablename__ = "sensor_readings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sensor_id = Column(UUID(as_uuid=True), ForeignKey("sensors.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    payload_jsonb = Column(JSON, default=dict)
    temp_c = Column(Float, nullable=True)
    humidity_pct = Column(Float, nullable=True)
    rainfall_mm = Column(Float, nullable=True)


class ClimateFeature(Base):
    __tablename__ = "climate_features"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_unit_id = Column(UUID(as_uuid=True), ForeignKey("admin_units.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    temp_min = Column(Float)
    temp_max = Column(Float)
    precip_mm = Column(Float)
    humidity = Column(Float)
    source = Column(String(50))
