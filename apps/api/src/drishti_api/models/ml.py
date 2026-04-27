import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TenantMixin


class MLModel(Base, TenantMixin):
    __tablename__ = "models"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False)
    vertical_id = Column(UUID(as_uuid=True), ForeignKey("verticals.id"), nullable=True)
    target_disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id"), nullable=True)
    training_data_ref = Column(String(512))
    metrics_jsonb = Column(JSON, default=dict)
    status = Column(String(20), default="training")
    created_at = Column(DateTime, default=datetime.utcnow)


class Prediction(Base, TenantMixin):
    __tablename__ = "predictions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("models.id"), nullable=False)
    admin_unit_id = Column(UUID(as_uuid=True), ForeignKey("admin_units.id"), nullable=False)
    target_date = Column(DateTime, nullable=False)
    target_horizon = Column(String(10), nullable=False)
    risk_score = Column(Float, nullable=False)
    uncertainty = Column(Float, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)
