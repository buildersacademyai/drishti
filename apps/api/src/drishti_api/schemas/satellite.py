import uuid
from datetime import datetime
from pydantic import BaseModel


class SatelliteAcquisitionCreate(BaseModel):
    admin_unit_id: uuid.UUID
    source: str = "sentinel-2"
    cloud_cover_pct: float = 0.0
    storage_uri: str | None = None


class SatelliteAcquisitionOut(BaseModel):
    id: uuid.UUID
    admin_unit_id: uuid.UUID
    source: str
    cloud_cover_pct: float
    storage_uri: str | None
    acquired_at: datetime
    model_config = {"from_attributes": True}
