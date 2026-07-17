from geoalchemy2.shape import from_shape
from shapely.geometry import box

from drishti_api.models.detection import Detection
from drishti_api.models.drone import Mission
from drishti_api.models.geo import AdminUnit, Tenant
from drishti_api.models.satellite import SatelliteAcquisition, SatelliteDetection
from drishti_api.services.mission_service import create_detection_from_completed_mission


def _make_tenant_and_unit(db, name="MSVC"):
    tenant = Tenant(name=f"T-{name}", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code=f"NP-{name}", name=f"{name}District",
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    return tenant, unit


def test_create_detection_from_completed_verification_mission(db):
    tenant, unit = _make_tenant_and_unit(db, "A")
    mission = Mission(tenant_id=tenant.id, mission_type="verification", status="completed",
                      admin_unit_id=unit.id)
    db.add(mission)
    db.flush()

    detection = create_detection_from_completed_mission(db, mission)

    assert detection is not None
    assert detection.mission_id == mission.id
    assert detection.detection_type == "unclassified"
    assert detection.status == "pending_review"


def test_create_detection_skips_non_verification_missions(db):
    tenant, unit = _make_tenant_and_unit(db, "B")
    mission = Mission(tenant_id=tenant.id, mission_type="intervention", status="completed",
                      admin_unit_id=unit.id)
    db.add(mission)
    db.flush()

    detection = create_detection_from_completed_mission(db, mission)

    assert detection is None
    assert db.query(Detection).filter(Detection.mission_id == mission.id).count() == 0


def test_create_detection_is_idempotent(db):
    tenant, unit = _make_tenant_and_unit(db, "C")
    mission = Mission(tenant_id=tenant.id, mission_type="verification", status="completed",
                      admin_unit_id=unit.id)
    db.add(mission)
    db.flush()

    first = create_detection_from_completed_mission(db, mission)
    second = create_detection_from_completed_mission(db, mission)

    assert first is not None
    assert second is None
    assert db.query(Detection).filter(Detection.mission_id == mission.id).count() == 1


def test_create_detection_copies_geometry_from_satellite_detection(db):
    tenant, unit = _make_tenant_and_unit(db, "D")
    acq = SatelliteAcquisition(tenant_id=tenant.id, admin_unit_id=unit.id, source="manual")
    db.add(acq)
    db.flush()
    sat_det = SatelliteDetection(
        tenant_id=tenant.id, acquisition_id=acq.id,
        geometry=from_shape(box(84.3, 27.6, 84.4, 27.7), srid=4326),
        detection_type="manual_pin", confidence=1.0,
    )
    db.add(sat_det)
    db.flush()
    mission = Mission(tenant_id=tenant.id, mission_type="verification", status="completed",
                      admin_unit_id=unit.id, satellite_detection_id=sat_det.id)
    db.add(mission)
    db.flush()

    detection = create_detection_from_completed_mission(db, mission)

    assert detection is not None
    assert detection.geometry is not None
