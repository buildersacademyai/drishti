from pymavlink import mavutil

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
