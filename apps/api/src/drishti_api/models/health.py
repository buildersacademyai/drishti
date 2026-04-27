import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TenantMixin


class CaseReport(Base, TenantMixin):
    __tablename__ = "case_reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_unit_id = Column(UUID(as_uuid=True), ForeignKey("admin_units.id"), nullable=False)
    disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id"), nullable=False)
    age_group = Column(String(20))
    reported_at = Column(DateTime, default=datetime.utcnow)
    source = Column(String(50))
    count = Column(Integer, default=1)
