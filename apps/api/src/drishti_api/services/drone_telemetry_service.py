from datetime import datetime

from pymavlink import mavutil
from sqlalchemy.orm import Session

from ..models.drone import Drone

HEARTBEAT_TIMEOUT_S = 5
MESSAGE_TIMEOUT_S = 5


def poll_drone_telemetry(drone, connect_fn=mavutil.mavlink_connection) -> dict | None:
    """Opens a short-lived MAVLink connection, reads one telemetry snapshot,
    closes. Returns None if there's no connection configured or the drone
    doesn't answer in time — a single bad poll should never raise, since
    poll_all_drones must keep going for the other drones.
    """
    if not drone.connection_string:
        return None

    conn = connect_fn(drone.connection_string)
    try:
        heartbeat = conn.wait_heartbeat(timeout=HEARTBEAT_TIMEOUT_S)
        if heartbeat is None:
            return None

        armed = bool(heartbeat.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED)
        position = conn.recv_match(type="GLOBAL_POSITION_INT", blocking=True, timeout=MESSAGE_TIMEOUT_S)
        sys_status = conn.recv_match(type="SYS_STATUS", blocking=True, timeout=MESSAGE_TIMEOUT_S)

        battery_pct = None
        if sys_status is not None and sys_status.battery_remaining is not None and sys_status.battery_remaining >= 0:
            battery_pct = sys_status.battery_remaining

        return {
            "armed": armed,
            "lat": position.lat / 1e7 if position is not None else None,
            "lng": position.lon / 1e7 if position is not None else None,
            "battery_pct": battery_pct,
        }
    finally:
        conn.close()


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

        if drone.status not in ("maintenance", "offline"):
            drone.status = "in_field" if snapshot["armed"] else "at_station"
        if snapshot["battery_pct"] is not None:
            drone.battery_pct = snapshot["battery_pct"]
        if snapshot["lat"] is not None:
            drone.current_lat = snapshot["lat"]
        if snapshot["lng"] is not None:
            drone.current_lng = snapshot["lng"]
        drone.last_seen = datetime.utcnow()
        updated.append(drone.id)

    db.flush()
    return updated
