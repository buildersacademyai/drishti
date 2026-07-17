import uuid as uuid_lib

from drishti_api.auth import create_access_token
from drishti_api.models.drone import Mission
from drishti_api.models.geo import AdminUnit, Tenant
from drishti_api.models.intervention import User


def _auth_header(db, tenant):
    user = User(tenant_id=tenant.id, email=f"user-{uuid_lib.uuid4()}@test.com", role="admin")
    db.add(user)
    db.flush()
    token = create_access_token(subject=str(user.id), role="admin", tenant_id=str(tenant.id))
    return {"Authorization": f"Bearer {token}"}


def _make_tenant_unit_and_mission(db, name="MS"):
    tenant = Tenant(name=f"T-{name}", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code=f"NP-{name}", name=f"{name}District",
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    mission = Mission(tenant_id=tenant.id, mission_type="verification", status="planned",
                      admin_unit_id=unit.id)
    db.add(mission)
    db.flush()
    return tenant, unit, mission


def test_update_mission_status(client, db):
    tenant, unit, mission = _make_tenant_unit_and_mission(db, "UPD")
    headers = _auth_header(db, tenant)

    resp = client.patch(f"/api/v1/missions/{mission.id}", json={"status": "in_progress"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "in_progress"

    listed = client.get("/api/v1/missions").json()
    updated = next(m for m in listed if m["id"] == str(mission.id))
    assert updated["status"] == "in_progress"


def test_update_mission_status_to_completed_sets_executed_at(client, db):
    tenant, unit, mission = _make_tenant_unit_and_mission(db, "COMP")
    headers = _auth_header(db, tenant)

    resp = client.patch(f"/api/v1/missions/{mission.id}", json={"status": "completed"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"
    assert resp.json()["executed_at"] is not None


def test_update_mission_status_rejects_invalid_value(client, db):
    tenant, unit, mission = _make_tenant_unit_and_mission(db, "INVALID")
    headers = _auth_header(db, tenant)

    resp = client.patch(f"/api/v1/missions/{mission.id}", json={"status": "not_a_real_status"}, headers=headers)
    assert resp.status_code == 422


def test_update_mission_status_requires_auth(client, db):
    tenant, unit, mission = _make_tenant_unit_and_mission(db, "NOAUTH")

    resp = client.patch(f"/api/v1/missions/{mission.id}", json={"status": "in_progress"})
    assert resp.status_code == 401


def test_update_mission_status_rejects_cross_tenant(client, db):
    owner_tenant, owner_unit, mission = _make_tenant_unit_and_mission(db, "OWNER")
    attacker_tenant = Tenant(name="T-attacker-mission", settings_jsonb={})
    db.add(attacker_tenant)
    db.flush()

    resp = client.patch(f"/api/v1/missions/{mission.id}", json={"status": "in_progress"},
                        headers=_auth_header(db, attacker_tenant))
    assert resp.status_code == 404


def test_update_mission_status_404_for_unknown_id(client, db):
    tenant = Tenant(name="T-unknown-mission", settings_jsonb={})
    db.add(tenant)
    db.flush()

    resp = client.patch(f"/api/v1/missions/{uuid_lib.uuid4()}", json={"status": "in_progress"},
                        headers=_auth_header(db, tenant))
    assert resp.status_code == 404


def test_completing_verification_mission_creates_detection_for_classification(client, db):
    tenant, unit, mission = _make_tenant_unit_and_mission(db, "COMPLETE")
    headers = _auth_header(db, tenant)

    resp = client.patch(f"/api/v1/missions/{mission.id}", json={"status": "completed"}, headers=headers)
    assert resp.status_code == 200
    detection_id = resp.json()["detection_id"]
    assert detection_id is not None

    listed = client.get(f"/api/v1/detections?mission_id={mission.id}").json()
    assert len(listed) == 1
    assert listed[0]["id"] == detection_id
    assert listed[0]["status"] == "pending_review"


def test_create_mission_with_name(client, db):
    tenant, unit, _existing = _make_tenant_unit_and_mission(db, "NAMED")

    resp = client.post("/api/v1/missions", json={
        "mission_type": "verification",
        "admin_unit_id": str(unit.id),
        "name": "Narayani riverside check",
    })
    assert resp.status_code == 201
    assert resp.json()["name"] == "Narayani riverside check"


def test_list_missions_includes_name_and_district(client, db):
    tenant, unit, mission = _make_tenant_unit_and_mission(db, "LISTNAME")
    mission.name = "Test Mission Name"
    db.flush()

    listed = client.get("/api/v1/missions").json()
    row = next(m for m in listed if m["id"] == str(mission.id))
    assert row["name"] == "Test Mission Name"
    assert row["admin_unit_name"] == "LISTNAMEDistrict"
