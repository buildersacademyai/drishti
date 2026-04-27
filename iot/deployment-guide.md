# IoT Deployment Guide

## Architecture (described — firmware not built in MVP)

ESP32-based sensor nodes with DHT22 (temp/humidity) and BMP280 (pressure).
Transmission: LoRaWAN or WiFi depending on site.
MQTT broker (Mosquitto) receives readings → POST /api/v1/sensors/readings.

## Hardware BOM

| Component | Qty per node | Unit cost |
|-----------|-------------|-----------|
| ESP32 DevKit | 1 | $4 |
| DHT22 | 1 | $3 |
| BMP280 | 1 | $2 |
| LoRa module (SX1276) | 1 (LoRaWAN sites) | $8 |
| Weatherproof enclosure | 1 | $5 |

## Integration

Sensor readings POST to: `POST /api/v1/sensors/readings`
Payload schema: `{ sensor_id, timestamp, temp_c, humidity_pct, rainfall_mm, payload_jsonb }`
