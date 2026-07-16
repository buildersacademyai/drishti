from drishti_api.models.geo import Tenant, AdminUnit


def test_list_admin_units(client, db):
    tenant = Tenant(name="T-au", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=2, code="NP-AU", name="AuDistrict",
                     population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()

    resp = client.get("/api/v1/admin-units")
    assert resp.status_code == 200
    rows = resp.json()
    by_id = {r["id"]: r for r in rows}
    assert by_id[str(unit.id)]["name"] == "AuDistrict"
