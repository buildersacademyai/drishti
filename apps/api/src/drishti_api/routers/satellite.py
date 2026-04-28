import uuid
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..models.satellite import SatelliteAcquisition, SatelliteDetection
from ..schemas.satellite import SatelliteAcquisitionCreate, SatelliteAcquisitionOut
from ..config import settings

router = APIRouter()


@router.post("/acquisitions", response_model=SatelliteAcquisitionOut, status_code=201)
def create_acquisition(body: SatelliteAcquisitionCreate, db: Session = Depends(get_db)):
    acq = SatelliteAcquisition(
        tenant_id=settings.seed_tenant_id,
        admin_unit_id=body.admin_unit_id,
        source=body.source,
        cloud_cover_pct=body.cloud_cover_pct,
        storage_uri=body.storage_uri,
    )
    db.add(acq)
    db.commit()
    db.refresh(acq)
    return acq


@router.get("/detections")
def list_detections(admin_unit_id: uuid.UUID | None = None, db: Session = Depends(get_db)):
    stmt = select(SatelliteDetection)
    if admin_unit_id:
        stmt = stmt.join(SatelliteAcquisition).where(
            SatelliteAcquisition.admin_unit_id == admin_unit_id
        )
    detections = db.execute(stmt).scalars().all()
    features = []
    for d in detections:
        geom_json = db.execute(
            select(SatelliteDetection.geometry.ST_AsGeoJSON()).where(SatelliteDetection.id == d.id)
        ).scalar()
        features.append({
            "type": "Feature",
            "geometry": json.loads(geom_json) if geom_json else None,
            "properties": {
                "id": str(d.id),
                "detection_type": d.detection_type,
                "confidence": d.confidence,
                "area_sqm": d.area_sqm,
                "promoted": d.promoted,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            },
        })
    return {"type": "FeatureCollection", "features": features}


@router.post("/detections/{detection_id}/promote", status_code=200)
def promote_detection(detection_id: uuid.UUID, db: Session = Depends(get_db)):
    det = db.get(SatelliteDetection, detection_id)
    if not det:
        raise HTTPException(status_code=404, detail="Detection not found")
    det.promoted = "promoted"
    db.commit()
    return {"id": str(det.id), "promoted": det.promoted}
