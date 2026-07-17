import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from .base import Base, TenantMixin


class Drone(Base, TenantMixin):
    """Physical drone hardware asset."""
    __tablename__ = "drones"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)           # "Eagle-1"
    model = Column(String(100), nullable=True)           # "DJI Matrice 300 RTK"
    serial_number = Column(String(100), nullable=True)
    connection_string = Column(String(255), nullable=True)  # MAVLink endpoint, e.g. "udp:127.0.0.1:14550"
    status = Column(String(30), nullable=False, default="at_station")
    # at_station | in_field | charging | maintenance | offline
    battery_pct = Column(Integer, nullable=True)         # 0-100
    total_flight_hours = Column(Float, default=0.0)
    last_seen = Column(DateTime, nullable=True)
    current_mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=True)
    home_lat = Column(Float, nullable=True)              # station coords
    home_lng = Column(Float, nullable=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    notes = Column(String(500), nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)


class Mission(Base, TenantMixin):
    __tablename__ = "missions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=True)
    mission_type = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False, default="planned")
    admin_unit_id = Column(UUID(as_uuid=True), ForeignKey("admin_units.id"), nullable=False)
    triggered_by = Column(String(255))
    satellite_detection_id = Column(UUID(as_uuid=True), ForeignKey("satellite_detections.id"), nullable=True)
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
