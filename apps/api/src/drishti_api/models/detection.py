import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from .base import Base, TenantMixin


class Detection(Base, TenantMixin):
    __tablename__ = "detections"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    imagery_id = Column(UUID(as_uuid=True), ForeignKey("imagery.id"), nullable=True)
    vertical_id = Column(UUID(as_uuid=True), ForeignKey("verticals.id"), nullable=True)
    detection_type = Column(String(50), nullable=False)
    geometry = Column(Geometry("POINT", srid=4326), nullable=True)
    confidence = Column(Float, nullable=False)
    model_id = Column(UUID(as_uuid=True), ForeignKey("models.id"), nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=True)
    status = Column(String(20), nullable=False, default="pending_review")
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
