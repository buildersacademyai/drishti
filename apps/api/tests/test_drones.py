import uuid

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


def test_editing_a_drone_does_not_fake_a_live_connection(client, db):
    """Editing any field (name, connection_string, notes, ...) must not
    stamp last_seen — that would make the connected badge lie about
    telemetry that was never actually received. Only real polling
    (poll_all_drones/poll_drone_connection_now) sets last_seen."""
    created = client.post("/api/v1/drones", json={
        "name": "Eagle-3b", "connection_string": "udpout:192.168.4.1:14550",
    }).json()
    assert created["last_seen"] is None
    assert created["connected"] is False

    resp = client.patch(f"/api/v1/drones/{created['id']}", json={"notes": "just editing a field"})

    assert resp.json()["last_seen"] is None
    assert resp.json()["connected"] is False


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


def test_create_drone_accepts_udpout_scheme(client, db):
    """Some drones (e.g. an ESP8266 running as its own UDP server) expect
    us to dial out to them, not wait for a push — plain udp: always binds
    and listens regardless of what's in the string (pymavlink default),
    so connecting out needs the explicit udpout: prefix."""
    resp = client.post("/api/v1/drones", json={
        "name": "Eagle-5b",
        "connection_string": "udpout:192.168.4.1:14550",
    })
    assert resp.status_code == 201
    assert resp.json()["connection_string"] == "udpout:192.168.4.1:14550"

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


def test_create_drone_with_telemetry_source_ip_persists_it(client, db):
    resp = client.post("/api/v1/drones", json={
        "name": "Eagle-9", "connection_string": "udp:0.0.0.0:14550",
        "telemetry_source_ip": "192.168.4.1",
    })
    assert resp.status_code == 201
    assert resp.json()["telemetry_source_ip"] == "192.168.4.1"


def test_update_drone_telemetry_source_ip(client, db):
    created = client.post("/api/v1/drones", json={"name": "Eagle-10"}).json()
    resp = client.patch(f"/api/v1/drones/{created['id']}", json={
        "telemetry_source_ip": "192.168.4.2",
    })
    assert resp.status_code == 200
    assert resp.json()["telemetry_source_ip"] == "192.168.4.2"


def test_create_drone_rejects_invalid_telemetry_source_ip(client, db):
    resp = client.post("/api/v1/drones", json={
        "name": "Eagle-11", "telemetry_source_ip": "not-an-ip",
    })
    assert resp.status_code == 422


def test_connect_drone_404_when_not_found(client, db):
    resp = client.post(f"/api/v1/drones/{uuid.uuid4()}/connect")
    assert resp.status_code == 404


def test_connect_drone_422_when_no_connection_string(client, db):
    created = client.post("/api/v1/drones", json={"name": "Eagle-12"}).json()
    resp = client.post(f"/api/v1/drones/{created['id']}/connect")
    assert resp.status_code == 422


def test_new_drone_is_not_connected_by_default(client, db):
    resp = client.post("/api/v1/drones", json={"name": "Eagle-13"})
    assert resp.json()["connected"] is False


def test_new_drone_flight_telemetry_fields_are_null(client, db):
    resp = client.post("/api/v1/drones", json={"name": "Eagle-14"})
    body = resp.json()
    assert body["altitude_m"] is None
    assert body["heading_deg"] is None
    assert body["speed_mps"] is None
    assert body["gps_fix_type"] is None
    assert body["satellites_visible"] is None


class _SyncTaskResult:
    """Stands in for the AsyncResult returned by task.apply_async(...) — the
    router calls .get(timeout=...) on it, expecting either a value or an
    exception. Connect/disconnect run in the worker process (real MAVLink
    connections live there), so router-level tests dispatch a fake task
    instead of a real one — the underlying service functions already have
    their own direct unit tests.
    """
    def __init__(self, value=None, raises=None):
        self._value = value
        self._raises = raises

    def get(self, timeout=None):
        if self._raises is not None:
            raise self._raises
        return self._value


def test_disconnect_drone_404_when_not_found(client, db, monkeypatch):
    from drishti_api.routers import drones as drones_router
    monkeypatch.setattr(drones_router.disconnect_now, "apply_async",
                        lambda args, **kw: _SyncTaskResult({"telemetry_paused": True}))

    resp = client.post(f"/api/v1/drones/{uuid.uuid4()}/disconnect")
    assert resp.status_code == 404


def test_disconnect_drone_sets_paused_and_not_connected(client, db, monkeypatch):
    from datetime import datetime
    from drishti_api.models.drone import Drone
    from drishti_api.routers import drones as drones_router
    from drishti_api.services.drone_telemetry_service import pause_drone_telemetry

    created = client.post("/api/v1/drones", json={
        "name": "Eagle-15", "connection_string": "udp:0.0.0.0:14550",
    }).json()
    row = db.get(Drone, uuid.UUID(created["id"]))
    row.last_seen = datetime.utcnow()  # simulate a live link
    db.commit()
    assert client.get(f"/api/v1/drones/{created['id']}").json()["connected"] is True

    def fake_apply_async(args, **kwargs):
        drone = db.get(Drone, uuid.UUID(args[0]))
        pause_drone_telemetry(db, drone)
        db.commit()
        return _SyncTaskResult({"telemetry_paused": True})

    monkeypatch.setattr(drones_router.disconnect_now, "apply_async", fake_apply_async)

    resp = client.post(f"/api/v1/drones/{created['id']}/disconnect")
    assert resp.status_code == 200

    after = client.get(f"/api/v1/drones/{created['id']}").json()
    assert after["connected"] is False
    assert after["telemetry_paused"] is True


def test_disconnect_drone_504_when_worker_does_not_respond(client, db, monkeypatch):
    from drishti_api.routers import drones as drones_router

    created = client.post("/api/v1/drones", json={"name": "Eagle-16a"}).json()
    monkeypatch.setattr(drones_router.disconnect_now, "apply_async",
                        lambda args, **kw: _SyncTaskResult(raises=TimeoutError()))

    resp = client.post(f"/api/v1/drones/{created['id']}/disconnect")
    assert resp.status_code == 504


def test_connect_drone_clears_paused_flag(client, db, monkeypatch):
    from drishti_api.models.drone import Drone
    from drishti_api.routers import drones as drones_router
    from drishti_api.services.drone_telemetry_service import pause_drone_telemetry, resume_drone_telemetry

    created = client.post("/api/v1/drones", json={
        "name": "Eagle-16", "connection_string": "udp:0.0.0.0:19999",
    }).json()

    def fake_disconnect(args, **kwargs):
        drone = db.get(Drone, uuid.UUID(args[0]))
        pause_drone_telemetry(db, drone)
        db.commit()
        return _SyncTaskResult({"telemetry_paused": True})

    def fake_connect(args, **kwargs):
        drone = db.get(Drone, uuid.UUID(args[0]))
        resume_drone_telemetry(db, drone)
        db.commit()
        return _SyncTaskResult({"connected": False})

    monkeypatch.setattr(drones_router.disconnect_now, "apply_async", fake_disconnect)
    monkeypatch.setattr(drones_router.connect_now, "apply_async", fake_connect)

    client.post(f"/api/v1/drones/{created['id']}/disconnect")
    assert client.get(f"/api/v1/drones/{created['id']}").json()["telemetry_paused"] is True

    client.post(f"/api/v1/drones/{created['id']}/connect")

    assert client.get(f"/api/v1/drones/{created['id']}").json()["telemetry_paused"] is False


def test_connect_drone_504_when_worker_does_not_respond(client, db, monkeypatch):
    from drishti_api.routers import drones as drones_router

    created = client.post("/api/v1/drones", json={
        "name": "Eagle-16b", "connection_string": "udp:0.0.0.0:19998",
    }).json()
    monkeypatch.setattr(drones_router.connect_now, "apply_async",
                        lambda args, **kw: _SyncTaskResult(raises=TimeoutError()))

    resp = client.post(f"/api/v1/drones/{created['id']}/connect")
    assert resp.status_code == 504
