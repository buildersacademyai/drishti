import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from .base import Base, TenantMixin


class Intervention(Base, TenantMixin):
    __tablename__ = "interventions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    detection_id = Column(UUID(as_uuid=True), ForeignKey("detections.id"), nullable=True)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=True)
    intervention_type = Column(String(50), nullable=False)
    target_geometry = Column(Geometry("POINT", srid=4326), nullable=True)
    executed_at = Column(DateTime, default=datetime.utcnow)
    larvicide_ml = Column(Float, nullable=True)
    operator_notes = Column(Text, nullable=True)


class Alert(Base, TenantMixin):
    __tablename__ = "alerts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prediction_id = Column(UUID(as_uuid=True), ForeignKey("predictions.id"), nullable=True)
    satellite_detection_id = Column(UUID(as_uuid=True), ForeignKey("satellite_detections.id"), nullable=True)
    severity = Column(String(20), nullable=False)
    recipient_role = Column(String(50))
    channel = Column(String(20))
    sent_at = Column(DateTime, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)


class User(Base, TenantMixin):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False, default="")
    name = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="fchv")
    admin_unit_id = Column(UUID(as_uuid=True), ForeignKey("admin_units.id"), nullable=True)
    locale = Column(String(10), default="en")
    phone = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Translation(Base):
    __tablename__ = "translations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    locale = Column(String(10), nullable=False)
    field = Column(String(100), nullable=False)
    value = Column(Text, nullable=False)


class AuditLog(Base, TenantMixin):
    __tablename__ = "audit_log"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(UUID(as_uuid=True), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    payload_jsonb = Column(JSON, default=dict)
