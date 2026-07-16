import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, aliased
from sqlalchemy import select
from ..db import get_db
from ..models.intervention import Alert
from ..models.geo import AdminUnit
from ..models.ml import Prediction
from ..models.satellite import SatelliteAcquisition, SatelliteDetection

router = APIRouter()

PredictionAdminUnit = aliased(AdminUnit)
SatelliteAdminUnit = aliased(AdminUnit)


def _serialize(
    a: Alert,
    prediction_unit_name: str | None,
    risk_score: float | None,
    satellite_unit_name: str | None,
    detection_area_sqm: float | None,
) -> dict:
    return {
        "id": str(a.id),
        "severity": a.severity,
        "channel": a.channel,
        "recipient_role": a.recipient_role,
        "admin_unit_name": prediction_unit_name or satellite_unit_name,
        "risk_score": risk_score,
        "detection_area_sqm": detection_area_sqm,
        "acknowledged_at": a.acknowledged_at.isoformat() if a.acknowledged_at else None,
        "created_at": a.sent_at.isoformat() if a.sent_at else None,
    }


def _with_district_info(db: Session, stmt):
    stmt = (
        stmt.add_columns(
            PredictionAdminUnit.name, Prediction.risk_score,
            SatelliteAdminUnit.name, SatelliteDetection.area_sqm,
        )
        .outerjoin(Prediction, Alert.prediction_id == Prediction.id)
        .outerjoin(PredictionAdminUnit, Prediction.admin_unit_id == PredictionAdminUnit.id)
        .outerjoin(SatelliteDetection, Alert.satellite_detection_id == SatelliteDetection.id)
        .outerjoin(SatelliteAcquisition, SatelliteDetection.acquisition_id == SatelliteAcquisition.id)
        .outerjoin(SatelliteAdminUnit, SatelliteAcquisition.admin_unit_id == SatelliteAdminUnit.id)
    )
    return db.execute(stmt).all()


@router.get("/active")
def get_active_alerts(db: Session = Depends(get_db)):
    stmt = select(Alert).where(Alert.acknowledged_at == None)  # noqa: E711
    rows = _with_district_info(db, stmt)
    return [_serialize(*row) for row in rows]


@router.get("")
def list_all_alerts(db: Session = Depends(get_db)):
    stmt = select(Alert).order_by(Alert.sent_at.desc())
    rows = _with_district_info(db, stmt)
    return [_serialize(*row) for row in rows]


@router.post("/{alert_id}/acknowledge", status_code=200)
def acknowledge_alert(alert_id: uuid.UUID, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged_at = datetime.utcnow()
    db.commit()
    return {"id": str(alert.id), "acknowledged_at": alert.acknowledged_at.isoformat()}
