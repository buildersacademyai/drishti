from types import SimpleNamespace

from pymavlink import mavutil

from drishti_api.services.drone_telemetry_service import poll_drone_telemetry


class FakeMessage(SimpleNamespace):
    pass


class FakeConnection:
    """Stands in for mavutil.mavlink_connection(...) — no real sockets."""

    def __init__(self, heartbeat=None, messages=None):
        self._heartbeat = heartbeat
        self._messages = messages or {}
        self.closed = False

    def wait_heartbeat(self, timeout=None):
        return self._heartbeat

    def recv_match(self, type=None, blocking=True, timeout=None):
        return self._messages.get(type)

    def close(self):
        self.closed = True


ARMED_BASE_MODE = mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED | 64  # armed + custom mode bit
DISARMED_BASE_MODE = 64


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

    assert result == {"armed": True, "lat": 27.529, "lng": 84.354, "battery_pct": 76}
    assert fake.closed is True


def test_poll_drone_telemetry_returns_none_on_heartbeat_timeout():
    drone = SimpleNamespace(connection_string="udp:127.0.0.1:14550")
    fake = FakeConnection(heartbeat=None)

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)

    assert result is None
    assert fake.closed is True


def test_poll_drone_telemetry_handles_missing_position_and_battery():
    drone = SimpleNamespace(connection_string="udp:127.0.0.1:14550")
    heartbeat = FakeMessage(base_mode=DISARMED_BASE_MODE)
    fake = FakeConnection(heartbeat=heartbeat, messages={})

    result = poll_drone_telemetry(drone, connect_fn=lambda conn_str: fake)

    assert result == {"armed": False, "lat": None, "lng": None, "battery_pct": None}


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

    assert result == {"armed": True, "lat": 27.529, "lng": 84.354, "battery_pct": None}
    assert fake.closed is True


from drishti_api.models.drone import Drone
from drishti_api.services.drone_telemetry_service import poll_all_drones


def _make_drone(db, tenant_id, name, connection_string=None, status="at_station"):
    drone = Drone(tenant_id=tenant_id, name=name, connection_string=connection_string, status=status)
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
