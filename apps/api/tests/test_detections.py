from drishti_api.models.geo import Tenant, AdminUnit
from drishti_api.models.drone import Mission
from drishti_api.models.detection import Detection


def test_list_detections_empty(client):
    resp = client.get("/api/v1/detections")
    assert resp.status_code == 200
    assert resp.json() == []


def test_trigger_intervention_requires_larvae_confirmed(client, db):
    tenant = Tenant(name="T", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-E",
                     name="E", population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    mission = Mission(tenant_id=tenant.id, mission_type="verification",
                      status="completed", admin_unit_id=unit.id)
    db.add(mission)
    db.flush()

    det = Detection(tenant_id=tenant.id, mission_id=mission.id,
                    detection_type="false_positive", confidence=0.1)
    db.add(det)
    db.flush()
    resp = client.post(f"/api/v1/detections/{det.id}/trigger-intervention")
    assert resp.status_code == 422

    det2 = Detection(tenant_id=tenant.id, mission_id=mission.id,
                     detection_type="larvae_confirmed", confidence=0.92)
    db.add(det2)
    db.flush()
    resp2 = client.post(f"/api/v1/detections/{det2.id}/trigger-intervention")
    assert resp2.status_code == 200
    assert "intervention_mission_id" in resp2.json()
