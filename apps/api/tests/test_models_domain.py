from drishti_api.models.satellite import SatelliteAcquisition
from drishti_api.models.drone import Mission
from drishti_api.models.geo import Tenant, AdminUnit


def test_satellite_acquisition(db):
    tenant = Tenant(name="T", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-X",
                     name="X", population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    acq = SatelliteAcquisition(
        tenant_id=tenant.id, admin_unit_id=unit.id,
        source="sentinel-2", cloud_cover_pct=5.0,
        storage_uri="s3://bucket/tile.tif"
    )
    db.add(acq)
    db.flush()
    assert acq.id is not None


def test_mission_created(db):
    tenant = Tenant(name="T2", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-Y",
                     name="Y", population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    mission = Mission(tenant_id=tenant.id, mission_type="verification",
                      status="planned", admin_unit_id=unit.id)
    db.add(mission)
    db.flush()
    assert mission.id is not None
    assert mission.status == "planned"
