from drishti_api.workers.celery_app import celery_app


def test_drone_poll_telemetry_task_is_registered():
    import drishti_api.workers.drone_telemetry  # noqa: F401 — registers the task

    assert "drone.poll_telemetry" in celery_app.tasks


def test_drone_poll_telemetry_is_scheduled_every_10_seconds():
    schedule_entry = celery_app.conf.beat_schedule["drone-telemetry-poll"]

    assert schedule_entry["task"] == "drone.poll_telemetry"
    assert schedule_entry["schedule"] == 10.0


def test_drone_connect_now_task_is_registered():
    import drishti_api.workers.drone_telemetry  # noqa: F401

    assert "drone.connect_now" in celery_app.tasks


def test_drone_disconnect_now_task_is_registered():
    import drishti_api.workers.drone_telemetry  # noqa: F401

    assert "drone.disconnect_now" in celery_app.tasks
