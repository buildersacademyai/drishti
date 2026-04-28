from drishti_api.models.geo import Tenant, AdminUnit
from drishti_api.models.iot import SensorType, Sensor


def test_ingest_sensor_reading(client, db):
    tenant = Tenant(name="T", settings_jsonb={})
    db.add(tenant)
    db.flush()
    unit = AdminUnit(tenant_id=tenant.id, level=4, code="W01",
                     name="Ward 1", population=0, child_pop_under_15=0)
    db.add(unit)
    db.flush()
    st = SensorType(code="dht22", name="DHT22", schema_jsonb={})
    db.add(st)
    db.flush()
    sensor = Sensor(tenant_id=tenant.id, sensor_type_id=st.id, admin_unit_id=unit.id)
    db.add(sensor)
    db.flush()

    resp = client.post("/api/v1/sensors/readings", json={
        "sensor_id": str(sensor.id), "temp_c": 32.5,
        "humidity_pct": 78.0, "rainfall_mm": 0.0, "payload_jsonb": {},
    })
    assert resp.status_code == 201
    assert "id" in resp.json()
