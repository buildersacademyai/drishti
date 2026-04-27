import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from .base import Base, TenantMixin


class Mission(Base, TenantMixin):
    __tablename__ = "missions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mission_type = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False, default="planned")
    admin_unit_id = Column(UUID(as_uuid=True), ForeignKey("admin_units.id"), nullable=False)
    triggered_by = Column(String(255))
    planned_at = Column(DateTime, default=datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)


class Flight(Base, TenantMixin):
    __tablename__ = "flights"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=False)
    data_source_id = Column(UUID(as_uuid=True), ForeignKey("data_sources.id"), nullable=True)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    operator_id = Column(UUID(as_uuid=True), nullable=True)
    mission_path_jsonb = Column(JSON, default=dict)
    payload_type = Column(String(30))


class Imagery(Base, TenantMixin):
    __tablename__ = "imagery"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    flight_id = Column(UUID(as_uuid=True), ForeignKey("flights.id"), nullable=False)
    captured_at = Column(DateTime, default=datetime.utcnow)
    storage_uri = Column(String(512), nullable=False)
    metadata_jsonb = Column(JSON, default=dict)
    geom_bbox = Column(Geometry("POLYGON", srid=4326), nullable=True)
    imagery_type = Column(String(20), default="survey")
