import uuid
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from ..db import get_db
from ..dependencies import get_current_user, CurrentUser
from ..models.drone import Mission
from ..models.geo import AdminUnit
from ..models.intervention import Alert
from ..models.satellite import SatelliteAcquisition, SatelliteDetection
from ..schemas.satellite import (
    DetectionNotesUpdate,
    ManualWaterSourceCreate,
    SatelliteAcquisitionCreate,
    SatelliteAcquisitionOut,
)
from ..services.satellite_ingest_service import (
    DetectionHasMissionError,
    create_manual_water_source,
    delete_detection,
    send_detection_to_mission,
    update_detection_notes,
)
from ..config import settings

router = APIRouter()


def _get_owned_detection(db: Session, detection_id: uuid.UUID, user: CurrentUser) -> SatelliteDetection:
    row = db.execute(
        select(SatelliteDetection, AdminUnit)
        .join(SatelliteAcquisition, SatelliteDetection.acquisition_id == SatelliteAcquisition.id)
        .join(AdminUnit, SatelliteAcquisition.admin_unit_id == AdminUnit.id)
        .where(SatelliteDetection.id == detection_id)
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Detection not found")
    detection, admin_unit = row
    if str(admin_unit.tenant_id) != user.tenant_id:
        raise HTTPException(status_code=404, detail="Detection not found")
    return detection


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


@router.get("/acquisitions")
def list_acquisitions(admin_unit_id: uuid.UUID | None = None, db: Session = Depends(get_db)):
    detection_counts = dict(
        db.execute(
            select(SatelliteDetection.acquisition_id, func.count(SatelliteDetection.id))
            .group_by(SatelliteDetection.acquisition_id)
        ).all()
    )
    new_site_counts = dict(
        db.execute(
            select(SatelliteDetection.acquisition_id, func.count(Alert.id))
            .join(Alert, Alert.satellite_detection_id == SatelliteDetection.id)
            .group_by(SatelliteDetection.acquisition_id)
        ).all()
    )

    stmt = select(SatelliteAcquisition, AdminUnit.name).join(
        AdminUnit, SatelliteAcquisition.admin_unit_id == AdminUnit.id
    )
    if admin_unit_id:
        stmt = stmt.where(SatelliteAcquisition.admin_unit_id == admin_unit_id)
    stmt = stmt.order_by(SatelliteAcquisition.acquired_at.desc())

    rows = db.execute(stmt).all()
    return [
        {
            "id": str(acq.id),
            "admin_unit_id": str(acq.admin_unit_id),
            "admin_unit_name": admin_unit_name,
            "source": acq.source,
            "cloud_cover_pct": acq.cloud_cover_pct,
            "acquired_at": acq.acquired_at.isoformat() if acq.acquired_at else None,
            "detection_count": detection_counts.get(acq.id, 0),
            "new_site_count": new_site_counts.get(acq.id, 0),
        }
        for acq, admin_unit_name in rows
    ]


def _mission_status_by_detection(db: Session, detection_ids: list) -> dict:
    if not detection_ids:
        return {}
    rows = db.execute(
        select(Mission.satellite_detection_id, Mission.status, Mission.planned_at)
        .where(Mission.satellite_detection_id.in_(detection_ids))
        .order_by(Mission.planned_at.desc())
    ).all()
    result = {}
    for detection_id, status, _planned_at in rows:
        result.setdefault(detection_id, status)  # first row per id = most recent (desc order)
    return result


@router.get("/acquisitions/{acquisition_id}")
def get_acquisition_detail(acquisition_id: uuid.UUID, db: Session = Depends(get_db)):
    row = db.execute(
        select(SatelliteAcquisition, AdminUnit.name)
        .join(AdminUnit, SatelliteAcquisition.admin_unit_id == AdminUnit.id)
        .where(SatelliteAcquisition.id == acquisition_id)
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Acquisition not found")
    acq, admin_unit_name = row

    detections = db.execute(
        select(SatelliteDetection).where(SatelliteDetection.acquisition_id == acquisition_id)
    ).scalars().all()

    new_site_ids = set(
        db.execute(
            select(SatelliteDetection.id)
            .join(Alert, Alert.satellite_detection_id == SatelliteDetection.id)
            .where(SatelliteDetection.acquisition_id == acquisition_id)
        ).scalars().all()
    )
    mission_status = _mission_status_by_detection(db, [d.id for d in detections])

    detection_rows = []
    for d in detections:
        geom_json = db.execute(
            select(SatelliteDetection.geometry.ST_AsGeoJSON()).where(SatelliteDetection.id == d.id)
        ).scalar()
        detection_rows.append({
            "id": str(d.id),
            "detection_type": d.detection_type,
            "confidence": d.confidence,
            "area_sqm": d.area_sqm,
            "promoted": d.promoted,
            "notes": d.notes,
            "is_new_site": d.id in new_site_ids,
            "mission_status": mission_status.get(d.id),
            "geometry": json.loads(geom_json) if geom_json else None,
        })
    detection_rows.sort(key=lambda d: -(d["area_sqm"] or 0))

    return {
        "id": str(acq.id),
        "admin_unit_id": str(acq.admin_unit_id),
        "admin_unit_name": admin_unit_name,
        "source": acq.source,
        "cloud_cover_pct": acq.cloud_cover_pct,
        "acquired_at": acq.acquired_at.isoformat() if acq.acquired_at else None,
        "detections": detection_rows,
    }


@router.get("/detections")
def list_detections(admin_unit_id: uuid.UUID | None = None, db: Session = Depends(get_db)):
    stmt = select(SatelliteDetection)
    if admin_unit_id:
        stmt = stmt.join(SatelliteAcquisition).where(
            SatelliteAcquisition.admin_unit_id == admin_unit_id
        )
    detections = db.execute(stmt).scalars().all()
    mission_status = _mission_status_by_detection(db, [d.id for d in detections])
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
                "notes": d.notes,
                "mission_status": mission_status.get(d.id),
                "created_at": d.created_at.isoformat() if d.created_at else None,
            },
        })
    return {"type": "FeatureCollection", "features": features}


@router.post("/detections/manual", status_code=201)
def create_manual_detection(
    body: ManualWaterSourceCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    admin_unit = db.get(AdminUnit, body.admin_unit_id)
    if not admin_unit or str(admin_unit.tenant_id) != user.tenant_id:
        raise HTTPException(status_code=404, detail="Admin unit not found")

    detection = create_manual_water_source(db, admin_unit, lat=body.lat, lng=body.lng, notes=body.notes)
    db.commit()
    return {
        "id": str(detection.id),
        "acquisition_id": str(detection.acquisition_id),
        "detection_type": detection.detection_type,
        "notes": detection.notes,
        "created_at": detection.created_at.isoformat() if detection.created_at else None,
    }


@router.patch("/detections/{detection_id}")
def update_detection(
    detection_id: uuid.UUID,
    body: DetectionNotesUpdate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    detection = _get_owned_detection(db, detection_id, user)
    update_detection_notes(db, detection, body.notes)
    db.commit()
    return {"id": str(detection.id), "notes": detection.notes}


@router.delete("/detections/{detection_id}", status_code=204)
def delete_detection_endpoint(
    detection_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    detection = _get_owned_detection(db, detection_id, user)
    try:
        delete_detection(db, detection)
    except DetectionHasMissionError:
        raise HTTPException(status_code=409, detail="Detection has a mission attached; deal with that first")
    db.commit()


@router.post("/detections/{detection_id}/send-to-mission", status_code=201)
def send_detection_to_mission_endpoint(
    detection_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    detection = _get_owned_detection(db, detection_id, user)
    acquisition = db.get(SatelliteAcquisition, detection.acquisition_id)
    admin_unit = db.get(AdminUnit, acquisition.admin_unit_id)
    mission = send_detection_to_mission(db, detection, admin_unit)
    db.commit()
    return {
        "id": str(mission.id),
        "name": mission.name,
        "status": mission.status,
        "mission_type": mission.mission_type,
        "satellite_detection_id": str(mission.satellite_detection_id),
    }


@router.post("/detections/{detection_id}/promote", status_code=200)
def promote_detection(detection_id: uuid.UUID, db: Session = Depends(get_db)):
    det = db.get(SatelliteDetection, detection_id)
    if not det:
        raise HTTPException(status_code=404, detail="Detection not found")
    det.promoted = "promoted"
    db.commit()
    return {"id": str(det.id), "promoted": det.promoted}
