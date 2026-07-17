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
