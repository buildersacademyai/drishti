from geoalchemy2.shape import from_shape, to_shape
from sqlalchemy.orm import Session

from ..models.detection import Detection
from ..models.drone import Mission
from ..models.satellite import SatelliteDetection


def create_detection_from_completed_mission(db: Session, mission: Mission) -> Detection | None:
    """A completed verification mission needs a human to classify what the
    drone found. Skips non-verification missions (an intervention mission
    completing shouldn't spawn another detection needing classification —
    that would loop) and is idempotent (repeated completion toggles don't
    create duplicates).
    """
    if mission.mission_type != "verification":
        return None

    existing = db.query(Detection).filter(Detection.mission_id == mission.id).first()
    if existing is not None:
        return None

    geometry = None
    if mission.satellite_detection_id:
        sat_detection = db.get(SatelliteDetection, mission.satellite_detection_id)
        if sat_detection is not None and sat_detection.geometry is not None:
            centroid = to_shape(sat_detection.geometry).centroid
            geometry = from_shape(centroid, srid=4326)

    detection = Detection(
        mission_id=mission.id,
        detection_type="unclassified",
        confidence=1.0,
        status="pending_review",
        geometry=geometry,
        tenant_id=mission.tenant_id,
    )
    db.add(detection)
    db.flush()
    return detection
