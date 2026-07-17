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


def test_create_drone_rejects_invalid_connection_string_scheme(client, db):
    resp = client.post("/api/v1/drones", json={
        "name": "Eagle-4",
        "connection_string": "serial:/dev/ttyUSB0",
    })
    assert resp.status_code == 422


def test_create_drone_accepts_udp_and_tcp_schemes(client, db):
    resp_udp = client.post("/api/v1/drones", json={
        "name": "Eagle-5",
        "connection_string": "udp:127.0.0.1:14550",
    })
    assert resp_udp.status_code == 201

    resp_tcp = client.post("/api/v1/drones", json={
        "name": "Eagle-6",
        "connection_string": "tcp:127.0.0.1:5760",
    })
    assert resp_tcp.status_code == 201


def test_update_drone_rejects_invalid_connection_string_scheme(client, db):
    created = client.post("/api/v1/drones", json={"name": "Eagle-7"}).json()
    resp = client.patch(f"/api/v1/drones/{created['id']}", json={
        "connection_string": "file:/etc/passwd",
    })
    assert resp.status_code == 422


def test_update_drone_edits_registration_fields(client, db):
    created = client.post("/api/v1/drones", json={
        "name": "Eagle-8", "model": "DJI Mavic", "serial_number": "SN-OLD",
        "home_lat": 27.0, "home_lng": 84.0,
    }).json()

    resp = client.patch(f"/api/v1/drones/{created['id']}", json={
        "name": "Falcon-8", "model": "DJI Matrice 300 RTK", "serial_number": "SN-NEW",
        "home_lat": 27.529, "home_lng": 84.354,
    })

    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Falcon-8"
    assert body["model"] == "DJI Matrice 300 RTK"
    assert body["serial_number"] == "SN-NEW"
    assert body["home_lat"] == 27.529
    assert body["home_lng"] == 84.354
