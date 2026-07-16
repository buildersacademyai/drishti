import uuid as uuid_lib

from drishti_api.auth import create_access_token
from drishti_api.models.geo import Tenant, AdminUnit
from drishti_api.models.intervention import User


def _auth_header(db, tenant):
    user = User(tenant_id=tenant.id, email=f"user-{uuid_lib.uuid4()}@test.com", role="admin")
    db.add(user)
    db.flush()
    token = create_access_token(subject=str(user.id), role="admin", tenant_id=str(tenant.id))
    return {"Authorization": f"Bearer {token}"}


def test_list_admin_units_requires_auth(client, db):
    resp = client.get("/api/v1/admin-units")
    assert resp.status_code == 401


def test_list_admin_units_scoped_to_caller_tenant(client, db):
    tenant1 = Tenant(name="T-au1", settings_jsonb={})
    tenant2 = Tenant(name="T-au2", settings_jsonb={})
    db.add_all([tenant1, tenant2])
    db.flush()
    unit1 = AdminUnit(tenant_id=tenant1.id, level=2, code="NP-AU1", name="Tenant1District",
                      population=0, child_pop_under_15=0)
    unit2 = AdminUnit(tenant_id=tenant2.id, level=2, code="NP-AU2", name="Tenant2District",
                      population=0, child_pop_under_15=0)
    db.add_all([unit1, unit2])
    db.flush()

    resp = client.get("/api/v1/admin-units", headers=_auth_header(db, tenant1))
    assert resp.status_code == 200
    names = {r["name"] for r in resp.json()}
    assert "Tenant1District" in names
    assert "Tenant2District" not in names
