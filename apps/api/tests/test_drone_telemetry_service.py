from types import SimpleNamespace

import pytest
from pymavlink import mavutil

from drishti_api.services.drone_telemetry_service import poll_drone_telemetry


@pytest.fixture(autouse=True)
def _clear_connection_cache():
    """Connections persist across polls (module-level cache) — tests must
    not leak a cached connection from one test into the next."""
    from drishti_api.services import drone_telemetry_service
    drone_telemetry_service._connections.clear()
    yield
    drone_telemetry_service._connections.clear()


class FakeMessage(SimpleNamespace):
    pass


class FakeConnection:
    """Stands in for mavutil.mavlink_connection(...) — no real sockets."""

    def __init__(self, heartbeat=None, messages=None, clients=None):
        self._heartbeat = heartbeat
        self._messages = messages or {}
        self.closed = False
        self.clients = clients if clients is not None else set()

    def wait_heartbeat(self, timeout=None):
        return self._heartbeat

    def recv_match(self, type=None, blocking=True, timeout=None):
        return self._messages.get(type)

    def close(self):
        self.closed = True


ARMED_BASE_MODE = mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED | 64  # armed + custom mode bit
DISARMED_BASE_MODE = 64

# Fields absent from a snapshot when GLOBAL_POSITION_INT/GPS_RAW_INT weren't sent
NO_EXTRA_TELEMETRY = {"alt_m": None, "heading_deg": None, "speed_mps": None, "gps_fix_type": None, "satellites_visible": None}


def test_poll_drone_telemetry_returns_none_without_connection_string():
    drone = SimpleNamespace(connection_string=None)

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: FakeConnection())

    assert result is None


def test_poll_drone_telemetry_happy_path_returns_snapshot():
    drone = SimpleNamespace(connection_string="udp:127.0.0.1:14550")
    heartbeat = FakeMessage(base_mode=ARMED_BASE_MODE)
    position = FakeMessage(lat=275_290_000, lon=843_540_000)  # 27.529, 84.354
    sys_status = FakeMessage(battery_remaining=76)
    fake = FakeConnection(
        heartbeat=heartbeat,
        messages={"GLOBAL_POSITION_INT": position, "SYS_STATUS": sys_status},
    )

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)

    assert result == {"armed": True, "lat": 27.529, "lng": 84.354, "battery_pct": 76, **NO_EXTRA_TELEMETRY}


def test_poll_drone_telemetry_reads_altitude_speed_heading_and_gps():
    drone = SimpleNamespace(connection_string="udp:127.0.0.1:14550")
    heartbeat = FakeMessage(base_mode=ARMED_BASE_MODE)
    position = FakeMessage(
        lat=275_290_000, lon=843_540_000,
        relative_alt=15_500,  # mm -> 15.5m
        hdg=9_000,  # centidegrees -> 90.0 deg
        vx=300, vy=400, vz=0,  # cm/s -> groundspeed 5.0 m/s (3-4-5 triangle)
    )
    sys_status = FakeMessage(battery_remaining=76)
    gps_raw = FakeMessage(fix_type=3, satellites_visible=11)
    fake = FakeConnection(
        heartbeat=heartbeat,
        messages={"GLOBAL_POSITION_INT": position, "SYS_STATUS": sys_status, "GPS_RAW_INT": gps_raw},
    )

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)

    assert result == {
        "armed": True, "lat": 27.529, "lng": 84.354, "battery_pct": 76,
        "alt_m": 15.5, "heading_deg": 90.0, "speed_mps": 5.0,
        "gps_fix_type": 3, "satellites_visible": 11,
    }


def test_poll_drone_telemetry_treats_unknown_heading_and_satellites_as_none():
    drone = SimpleNamespace(connection_string="udp:127.0.0.1:14550")
    heartbeat = FakeMessage(base_mode=DISARMED_BASE_MODE)
    position = FakeMessage(lat=275_290_000, lon=843_540_000, relative_alt=0, hdg=65535, vx=0, vy=0, vz=0)
    gps_raw = FakeMessage(fix_type=0, satellites_visible=255)  # MAVLink "unknown" sentinels
    fake = FakeConnection(
        heartbeat=heartbeat,
        messages={"GLOBAL_POSITION_INT": position, "GPS_RAW_INT": gps_raw},
    )

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)

    assert result["heading_deg"] is None
    assert result["satellites_visible"] is None
    assert result["gps_fix_type"] == 0


def test_poll_drone_telemetry_rejects_snapshot_from_unexpected_sender_ip():
    drone = SimpleNamespace(connection_string="udp:0.0.0.0:14550", telemetry_source_ip="192.168.4.1")
    heartbeat = FakeMessage(base_mode=ARMED_BASE_MODE)
    fake = FakeConnection(heartbeat=heartbeat, messages={}, clients={("10.0.0.99", 14550)})

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)

    assert result is None


def test_poll_drone_telemetry_accepts_snapshot_from_expected_sender_ip():
    drone = SimpleNamespace(connection_string="udp:0.0.0.0:14550", telemetry_source_ip="192.168.4.1")
    heartbeat = FakeMessage(base_mode=DISARMED_BASE_MODE)
    fake = FakeConnection(heartbeat=heartbeat, messages={}, clients={("192.168.4.1", 14550)})

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)

    assert result == {"armed": False, "lat": None, "lng": None, "battery_pct": None, **NO_EXTRA_TELEMETRY}


def test_poll_drone_telemetry_skips_sender_check_when_source_ip_not_configured():
    drone = SimpleNamespace(connection_string="udp:0.0.0.0:14550", telemetry_source_ip=None)
    heartbeat = FakeMessage(base_mode=DISARMED_BASE_MODE)
    fake = FakeConnection(heartbeat=heartbeat, messages={}, clients={("10.0.0.99", 14550)})

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)

    assert result == {"armed": False, "lat": None, "lng": None, "battery_pct": None, **NO_EXTRA_TELEMETRY}


def test_poll_drone_telemetry_returns_none_on_heartbeat_timeout():
    drone = SimpleNamespace(connection_string="udp:127.0.0.1:14550")
    fake = FakeConnection(heartbeat=None)

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)

    assert result is None


def test_poll_drone_telemetry_handles_missing_position_and_battery():
    drone = SimpleNamespace(connection_string="udp:127.0.0.1:14550")
    heartbeat = FakeMessage(base_mode=DISARMED_BASE_MODE)
    fake = FakeConnection(heartbeat=heartbeat, messages={})

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)

    assert result == {"armed": False, "lat": None, "lng": None, "battery_pct": None, **NO_EXTRA_TELEMETRY}


def test_poll_drone_telemetry_treats_unknown_battery_as_none():
    drone = SimpleNamespace(connection_string="udp:127.0.0.1:14550")
    heartbeat = FakeMessage(base_mode=ARMED_BASE_MODE)
    position = FakeMessage(lat=275_290_000, lon=843_540_000)  # 27.529, 84.354
    sys_status = FakeMessage(battery_remaining=-1)  # MAVLink unknown battery sentinel
    fake = FakeConnection(
        heartbeat=heartbeat,
        messages={"GLOBAL_POSITION_INT": position, "SYS_STATUS": sys_status},
    )

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)

    assert result == {"armed": True, "lat": 27.529, "lng": 84.354, "battery_pct": None, **NO_EXTRA_TELEMETRY}


def test_poll_drone_telemetry_reuses_connection_across_calls():
    drone = SimpleNamespace(connection_string="udp:127.0.0.1:14550")
    heartbeat = FakeMessage(base_mode=DISARMED_BASE_MODE)
    fake = FakeConnection(heartbeat=heartbeat, messages={})
    open_count = 0

    def connect_fn(conn_str):
        nonlocal open_count
        open_count += 1
        return fake

    poll_drone_telemetry(drone, connect_fn=connect_fn)
    poll_drone_telemetry(drone, connect_fn=connect_fn)
    poll_drone_telemetry(drone, connect_fn=connect_fn)

    assert open_count == 1
    assert fake.closed is False


def test_poll_drone_telemetry_opens_separate_connections_per_connection_string():
    drone_a = SimpleNamespace(connection_string="udp:127.0.0.1:14550")
    drone_b = SimpleNamespace(connection_string="udp:127.0.0.1:14551")
    heartbeat = FakeMessage(base_mode=DISARMED_BASE_MODE)
    opened = []

    def connect_fn(conn_str):
        fake = FakeConnection(heartbeat=heartbeat, messages={})
        opened.append(conn_str)
        return fake

    poll_drone_telemetry(drone_a, connect_fn=connect_fn)
    poll_drone_telemetry(drone_b, connect_fn=connect_fn)
    poll_drone_telemetry(drone_a, connect_fn=connect_fn)

    assert opened == ["udp:127.0.0.1:14550", "udp:127.0.0.1:14551"]


def test_poll_drone_telemetry_reopens_and_closes_old_connection_on_error():
    drone = SimpleNamespace(connection_string="udp:127.0.0.1:14550")

    class FailingConnection(FakeConnection):
        def wait_heartbeat(self, timeout=None):
            raise OSError("connection reset")

    failing = FailingConnection()
    replacement_heartbeat = FakeMessage(base_mode=DISARMED_BASE_MODE)
    replacement = FakeConnection(heartbeat=replacement_heartbeat, messages={})
    calls = iter([failing, replacement])

    def connect_fn(conn_str):
        return next(calls)

    with pytest.raises(OSError):
        poll_drone_telemetry(drone, connect_fn=connect_fn)
    assert failing.closed is True

    # Next poll opens a fresh connection instead of reusing the broken one
    result = poll_drone_telemetry(drone, connect_fn=connect_fn)
    assert result is not None
    assert replacement.closed is False


from drishti_api.models.drone import Drone
from drishti_api.services.drone_telemetry_service import poll_all_drones


def _make_drone(db, tenant_id, name, connection_string=None, status="at_station", telemetry_paused=False):
    drone = Drone(
        tenant_id=tenant_id, name=name, connection_string=connection_string,
        status=status, telemetry_paused=telemetry_paused,
    )
    db.add(drone)
    db.flush()
    return drone


def test_poll_all_drones_updates_drone_with_connection_string(db):
    tenant = _make_tenant_for_telemetry(db)
    drone = _make_drone(db, tenant.id, "Eagle-1", connection_string="udp:127.0.0.1:14550")
    heartbeat = FakeMessage(base_mode=ARMED_BASE_MODE)
    position = FakeMessage(lat=275_290_000, lon=843_540_000)
    sys_status = FakeMessage(battery_remaining=50)
    fake = FakeConnection(heartbeat=heartbeat, messages={"GLOBAL_POSITION_INT": position, "SYS_STATUS": sys_status})

    updated = poll_all_drones(db, connect_fn=lambda conn_str: fake)

    assert updated == [drone.id]
    db.refresh(drone)
    assert drone.status == "in_field"
    assert drone.battery_pct == 50
    assert drone.current_lat == 27.529
    assert drone.current_lng == 84.354
    assert drone.last_seen is not None


def test_poll_all_drones_skips_drone_without_connection_string(db):
    tenant = _make_tenant_for_telemetry(db)
    drone = _make_drone(db, tenant.id, "Eagle-2", connection_string=None)

    updated = poll_all_drones(db, connect_fn=lambda conn_str: FakeConnection())

    assert updated == []
    db.refresh(drone)
    assert drone.last_seen is None


def test_poll_all_drones_skips_paused_drone(db):
    tenant = _make_tenant_for_telemetry(db)
    drone = _make_drone(db, tenant.id, "Eagle-9", connection_string="udp:127.0.0.1:14550", telemetry_paused=True)

    updated = poll_all_drones(db, connect_fn=lambda conn_str: FakeConnection())

    assert updated == []
    db.refresh(drone)
    assert drone.last_seen is None


def test_poll_all_drones_preserves_manual_maintenance_status(db):
    tenant = _make_tenant_for_telemetry(db)
    drone = _make_drone(db, tenant.id, "Eagle-3", connection_string="udp:127.0.0.1:14550", status="maintenance")
    heartbeat = FakeMessage(base_mode=ARMED_BASE_MODE)
    fake = FakeConnection(heartbeat=heartbeat, messages={})

    poll_all_drones(db, connect_fn=lambda conn_str: fake)

    db.refresh(drone)
    assert drone.status == "maintenance"


def test_poll_all_drones_preserves_manual_offline_status(db):
    tenant = _make_tenant_for_telemetry(db)
    drone = _make_drone(db, tenant.id, "Eagle-6", connection_string="udp:127.0.0.1:14550", status="offline")
    heartbeat = FakeMessage(base_mode=ARMED_BASE_MODE)
    fake = FakeConnection(heartbeat=heartbeat, messages={})

    poll_all_drones(db, connect_fn=lambda conn_str: fake)

    db.refresh(drone)
    assert drone.status == "offline"


def test_poll_all_drones_one_failure_does_not_block_others(db):
    tenant = _make_tenant_for_telemetry(db)
    bad_drone = _make_drone(db, tenant.id, "Eagle-4", connection_string="udp:bad:1")
    good_drone = _make_drone(db, tenant.id, "Eagle-5", connection_string="udp:127.0.0.1:14550")
    heartbeat = FakeMessage(base_mode=DISARMED_BASE_MODE)
    good_fake = FakeConnection(heartbeat=heartbeat, messages={})

    def connect_fn(conn_str):
        if conn_str == "udp:bad:1":
            raise ConnectionRefusedError("no route to host")
        return good_fake

    updated = poll_all_drones(db, connect_fn=connect_fn)

    assert updated == [good_drone.id]


def _make_tenant_for_telemetry(db):
    from drishti_api.models.geo import Tenant
    tenant = Tenant(name="TelemetryTenant", settings_jsonb={})
    db.add(tenant)
    db.flush()
    return tenant


def test_poll_drone_connection_now_updates_row_and_returns_snapshot(db):
    from drishti_api.services.drone_telemetry_service import poll_drone_connection_now

    tenant = _make_tenant_for_telemetry(db)
    drone = _make_drone(db, tenant.id, "Eagle-7", connection_string="udp:127.0.0.1:14550")
    heartbeat = FakeMessage(base_mode=ARMED_BASE_MODE)
    position = FakeMessage(lat=275_290_000, lon=843_540_000)
    sys_status = FakeMessage(battery_remaining=61)
    fake = FakeConnection(heartbeat=heartbeat, messages={"GLOBAL_POSITION_INT": position, "SYS_STATUS": sys_status})

    snapshot = poll_drone_connection_now(db, drone, connect_fn=lambda conn_str: fake)

    assert snapshot == {"armed": True, "lat": 27.529, "lng": 84.354, "battery_pct": 61, **NO_EXTRA_TELEMETRY}
    db.refresh(drone)
    assert drone.status == "in_field"
    assert drone.battery_pct == 61
    assert drone.last_seen is not None


def test_poll_drone_connection_now_returns_none_when_unreachable(db):
    from drishti_api.services.drone_telemetry_service import poll_drone_connection_now

    tenant = _make_tenant_for_telemetry(db)
    drone = _make_drone(db, tenant.id, "Eagle-8", connection_string="udp:127.0.0.1:14550")
    fake = FakeConnection(heartbeat=None)

    snapshot = poll_drone_connection_now(db, drone, connect_fn=lambda conn_str: fake)

    assert snapshot is None
    db.refresh(drone)
    assert drone.last_seen is None


def test_pause_drone_telemetry_sets_flag_and_discards_cached_connection(db):
    from drishti_api.services.drone_telemetry_service import _connections, pause_drone_telemetry

    tenant = _make_tenant_for_telemetry(db)
    drone = _make_drone(db, tenant.id, "Eagle-10", connection_string="udp:127.0.0.1:14550")
    fake = FakeConnection(heartbeat=FakeMessage(base_mode=DISARMED_BASE_MODE), messages={})
    poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)
    assert "udp:127.0.0.1:14550" in _connections

    pause_drone_telemetry(db, drone)

    assert drone.telemetry_paused is True
    assert fake.closed is True
    assert "udp:127.0.0.1:14550" not in _connections


def test_resume_drone_telemetry_clears_flag(db):
    from drishti_api.services.drone_telemetry_service import resume_drone_telemetry

    tenant = _make_tenant_for_telemetry(db)
    drone = _make_drone(db, tenant.id, "Eagle-11", connection_string="udp:127.0.0.1:14550", telemetry_paused=True)

    resume_drone_telemetry(db, drone)

    assert drone.telemetry_paused is False
