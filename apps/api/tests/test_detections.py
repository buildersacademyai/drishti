import uuid as uuid_lib
from drishti_api.models.geo import Tenant, AdminUnit
from drishti_api.models.drone import Mission
from drishti_api.models.detection import Detection
from drishti_api.auth import create_access_token
from drishti_api.models.intervention import AuditLog, User


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

    # not yet verified -> still rejected
    resp_unverified = client.post(f"/api/v1/detections/{det2.id}/trigger-intervention")
    assert resp_unverified.status_code == 422

    # verify, then trigger succeeds
    client.post(f"/api/v1/detections/{det2.id}/verify", headers=_auth_header(db, tenant))
    resp2 = client.post(f"/api/v1/detections/{det2.id}/trigger-intervention")
    assert resp2.status_code == 200
    assert "intervention_mission_id" in resp2.json()


def _make_detection(db, tenant, unit, mission, detection_type="larvae_confirmed", confidence=0.9):
    det = Detection(tenant_id=tenant.id, mission_id=mission.id,
                    detection_type=detection_type, confidence=confidence)
    db.add(det)
    db.flush()
    return det


def _setup_tenant_unit_mission(db):
    tenant = Tenant(name="T2", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-V2",
                     name="V2", population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    mission = Mission(tenant_id=tenant.id, mission_type="verification",
                      status="completed", admin_unit_id=unit.id)
    db.add(mission)
    db.flush()
    return tenant, unit, mission


def _auth_header(db=None, tenant=None):
    # `verified_by` has a real FK to users.id (added in Task 1), so any request that
    # will actually persist a verify/reject must be signed for a real, persisted User —
    # otherwise the endpoint's UPDATE trips a ForeignKeyViolation against Postgres.
    # Callers that only need a syntactically valid, unauthenticated-adjacent token
    # (e.g. hitting a 404 before any write happens) can omit db/tenant.
    if db is not None and tenant is not None:
        user = User(tenant_id=tenant.id, email=f"verifier-{uuid_lib.uuid4()}@test.com",
                    role="admin")
        db.add(user)
        db.flush()
        subject = str(user.id)
        tenant_id = str(tenant.id)
    else:
        subject = str(uuid_lib.uuid4())
        tenant_id = str(uuid_lib.uuid4())
    token = create_access_token(subject=subject, role="admin", tenant_id=tenant_id)
    return {"Authorization": f"Bearer {token}"}


def test_verify_requires_auth(client, db):
    tenant, unit, mission = _setup_tenant_unit_mission(db)
    det = _make_detection(db, tenant, unit, mission)
    resp = client.post(f"/api/v1/detections/{det.id}/verify")
    assert resp.status_code == 401


def test_verify_sets_status_and_writes_audit_log(client, db):
    tenant, unit, mission = _setup_tenant_unit_mission(db)
    det = _make_detection(db, tenant, unit, mission)
    resp = client.post(f"/api/v1/detections/{det.id}/verify", headers=_auth_header(db, tenant))
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "verified"
    assert body["verified_by"] is not None

    db.refresh(det)
    assert det.status == "verified"
    assert det.verified_at is not None

    logs = db.query(AuditLog).filter(AuditLog.entity_id == det.id).all()
    assert len(logs) == 1
    assert logs[0].action == "detection_verified"
    assert logs[0].entity_type == "detection"


def test_verify_twice_returns_422(client, db):
    tenant, unit, mission = _setup_tenant_unit_mission(db)
    det = _make_detection(db, tenant, unit, mission)
    headers = _auth_header(db, tenant)
    client.post(f"/api/v1/detections/{det.id}/verify", headers=headers)
    resp = client.post(f"/api/v1/detections/{det.id}/verify", headers=headers)
    assert resp.status_code == 422


def test_reject_with_reason_and_without(client, db):
    tenant, unit, mission = _setup_tenant_unit_mission(db)
    headers = _auth_header(db, tenant)
    det1 = _make_detection(db, tenant, unit, mission, detection_type="false_positive")
    resp1 = client.post(f"/api/v1/detections/{det1.id}/reject",
                        json={"reason": "dry container"}, headers=headers)
    assert resp1.status_code == 200
    assert resp1.json()["status"] == "rejected"
    log1 = db.query(AuditLog).filter(AuditLog.entity_id == det1.id).one()
    assert log1.payload_jsonb["reason"] == "dry container"

    det2 = _make_detection(db, tenant, unit, mission, detection_type="false_positive")
    resp2 = client.post(f"/api/v1/detections/{det2.id}/reject", headers=headers)
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "rejected"


def test_verify_unknown_detection_404(client):
    resp = client.post(f"/api/v1/detections/{uuid_lib.uuid4()}/verify", headers=_auth_header())
    assert resp.status_code == 404
