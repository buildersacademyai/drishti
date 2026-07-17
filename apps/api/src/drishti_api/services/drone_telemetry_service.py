import math
from datetime import datetime

from pymavlink import mavutil
from sqlalchemy.orm import Session

from ..models.drone import Drone

HEARTBEAT_TIMEOUT_S = 5
MESSAGE_TIMEOUT_S = 5
HEADING_UNKNOWN = 65535  # MAVLink sentinel for "no heading available"
SATELLITES_UNKNOWN = 255  # MAVLink sentinel for "satellite count not reported"

# Persistent MAVLink connections, keyed by connection_string, shared across
# poll cycles (and both the periodic beat poll and the on-demand "Connect"
# button). A fresh bind/close every 10s doesn't survive Docker Desktop's UDP
# port forwarding reliably — keeping the socket open for the worker
# process's lifetime does. Requires the worker to run at concurrency=1 so
# every poll lands in the same process this dict lives in.
_connections: dict[str, object] = {}


def _get_connection(connection_string: str, connect_fn):
    conn = _connections.get(connection_string)
    if conn is None:
        conn = connect_fn(connection_string)
        _connections[connection_string] = conn
    return conn


def _discard_connection(connection_string: str) -> None:
    conn = _connections.pop(connection_string, None)
    if conn is not None:
        try:
            conn.close()
        except Exception:
            pass


def poll_drone_telemetry(drone, connect_fn=mavutil.mavlink_connection) -> dict | None:
    """Reads one telemetry snapshot over a persistent, cached MAVLink
    connection for this drone's connection_string (opened on first use, kept
    open afterward). Returns None if there's no connection configured or the
    drone doesn't answer in time. On a real connection error the cached
    connection is discarded (closed, evicted) so the next poll opens a fresh
    one — and the error is re-raised so poll_all_drones can skip this drone
    for the current cycle without blocking the others.
    """
    if not drone.connection_string:
        return None

    conn = _get_connection(drone.connection_string, connect_fn)
    try:
        heartbeat = conn.wait_heartbeat(timeout=HEARTBEAT_TIMEOUT_S)
        if heartbeat is None:
            return None

        expected_ip = getattr(drone, "telemetry_source_ip", None)
        if expected_ip:
            observed_ips = {addr[0] for addr in getattr(conn, "clients", set())}
            if observed_ips and not observed_ips.issubset({expected_ip}):
                return None

        armed = bool(heartbeat.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED)
        position = conn.recv_match(type="GLOBAL_POSITION_INT", blocking=True, timeout=MESSAGE_TIMEOUT_S)
        sys_status = conn.recv_match(type="SYS_STATUS", blocking=True, timeout=MESSAGE_TIMEOUT_S)
        gps_raw = conn.recv_match(type="GPS_RAW_INT", blocking=True, timeout=MESSAGE_TIMEOUT_S)

        battery_pct = None
        if sys_status is not None and sys_status.battery_remaining is not None and sys_status.battery_remaining >= 0:
            battery_pct = sys_status.battery_remaining

        alt_m = None
        heading_deg = None
        speed_mps = None
        if position is not None:
            relative_alt = getattr(position, "relative_alt", None)
            if relative_alt is not None:
                alt_m = relative_alt / 1000

            hdg = getattr(position, "hdg", None)
            if hdg is not None and hdg != HEADING_UNKNOWN:
                heading_deg = hdg / 100

            vx = getattr(position, "vx", None)
            vy = getattr(position, "vy", None)
            if vx is not None and vy is not None:
                speed_mps = math.hypot(vx, vy) / 100

        gps_fix_type = None
        satellites_visible = None
        if gps_raw is not None:
            gps_fix_type = gps_raw.fix_type
            if gps_raw.satellites_visible != SATELLITES_UNKNOWN:
                satellites_visible = gps_raw.satellites_visible

        return {
            "armed": armed,
            "lat": position.lat / 1e7 if position is not None else None,
            "lng": position.lon / 1e7 if position is not None else None,
            "battery_pct": battery_pct,
            "alt_m": alt_m,
            "heading_deg": heading_deg,
            "speed_mps": speed_mps,
            "gps_fix_type": gps_fix_type,
            "satellites_visible": satellites_visible,
        }
    except Exception:
        _discard_connection(drone.connection_string)
        raise


def _apply_snapshot(drone: Drone, snapshot: dict) -> None:
    if drone.status not in ("maintenance", "offline"):
        drone.status = "in_field" if snapshot["armed"] else "at_station"
    if snapshot["battery_pct"] is not None:
        drone.battery_pct = snapshot["battery_pct"]
    if snapshot["lat"] is not None:
        drone.current_lat = snapshot["lat"]
    if snapshot["lng"] is not None:
        drone.current_lng = snapshot["lng"]
    if snapshot["alt_m"] is not None:
        drone.altitude_m = snapshot["alt_m"]
    if snapshot["heading_deg"] is not None:
        drone.heading_deg = snapshot["heading_deg"]
    if snapshot["speed_mps"] is not None:
        drone.speed_mps = snapshot["speed_mps"]
    if snapshot["gps_fix_type"] is not None:
        drone.gps_fix_type = snapshot["gps_fix_type"]
    if snapshot["satellites_visible"] is not None:
        drone.satellites_visible = snapshot["satellites_visible"]
    drone.last_seen = datetime.utcnow()


def poll_all_drones(db: Session, connect_fn=mavutil.mavlink_connection) -> list:
    """Every drone with a connection_string gets one poll. A single drone's
    connection failure is swallowed here so the rest of the fleet still
    updates this cycle — the next 10s tick retries naturally.
    """
    drones = db.query(Drone).filter(Drone.connection_string.isnot(None)).all()
    updated = []
    for drone in drones:
        try:
            snapshot = poll_drone_telemetry(drone, connect_fn=connect_fn)
        except Exception:
            continue
        if snapshot is None:
            continue

        _apply_snapshot(drone, snapshot)
        updated.append(drone.id)

    db.flush()
    return updated


def poll_drone_connection_now(db: Session, drone: Drone, connect_fn=mavutil.mavlink_connection) -> dict | None:
    """On-demand single poll — e.g. a user clicking "Connect" in the UI wants
    an immediate answer, not to wait for the next beat tick. Same apply-to-row
    logic as poll_all_drones, just for one drone right now.
    """
    snapshot = poll_drone_telemetry(drone, connect_fn=connect_fn)
    if snapshot is None:
        return None
    _apply_snapshot(drone, snapshot)
    db.flush()
    return snapshot
