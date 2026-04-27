import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from .base import Base, TenantMixin


class SatelliteAcquisition(Base, TenantMixin):
    __tablename__ = "satellite_acquisitions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_unit_id = Column(UUID(as_uuid=True), ForeignKey("admin_units.id"), nullable=False)
    source = Column(String(50), nullable=False, default="sentinel-2")
    acquired_at = Column(DateTime, default=datetime.utcnow)
    cloud_cover_pct = Column(Float, default=0.0)
    storage_uri = Column(String(512))


class SatelliteDetection(Base, TenantMixin):
    __tablename__ = "satellite_detections"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    acquisition_id = Column(UUID(as_uuid=True), ForeignKey("satellite_acquisitions.id"), nullable=False)
    geometry = Column(Geometry("POLYGON", srid=4326), nullable=False)
    detection_type = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    area_sqm = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    promoted = Column(String(10), default="pending")
