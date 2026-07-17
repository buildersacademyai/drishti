from drishti_api.models.geo import Tenant


def _make_tenant(db, name="DT1"):
    tenant = Tenant(name=name, settings_jsonb={})
    db.add(tenant)
    db.flush()
    return tenant


def test_create_drone_with_connection_string_persists_it(client, db):
    resp = client.post("/api/v1/drones", json={
        "name": "Eagle-1",
        "connection_string": "udp:127.0.0.1:14550",
    })
    assert resp.status_code == 201
    body = resp.json()
    assert body["connection_string"] == "udp:127.0.0.1:14550"


def test_create_drone_without_connection_string_defaults_empty(client, db):
    resp = client.post("/api/v1/drones", json={"name": "Eagle-2"})
    assert resp.status_code == 201
    assert resp.json()["connection_string"] == ""


def test_update_drone_connection_string(client, db):
    created = client.post("/api/v1/drones", json={"name": "Eagle-3"}).json()
    resp = client.patch(f"/api/v1/drones/{created['id']}", json={
        "connection_string": "udp:127.0.0.1:14551",
    })
    assert resp.status_code == 200
    assert resp.json()["connection_string"] == "udp:127.0.0.1:14551"
