#pragma once

// ── WiFi ─────────────────────────────────────────────────────────────────────
#define WIFI_SSID     "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// ── Drishti API ───────────────────────────────────────────────────────────────
// Set to your API host, e.g. "api.yourdomain.org" or "192.168.1.100"
#define API_HOST      "api.drishti.health"
#define API_PORT      443
#define API_USE_HTTPS true
#define API_SENSOR_PATH "/api/v1/sensors/readings"

// Bearer token from POST /api/v1/auth/login (copy after provisioning)
#define API_TOKEN     "REPLACE_WITH_BEARER_TOKEN"

// ── Sensor identity ───────────────────────────────────────────────────────────
// UUID of this sensor row in the `sensors` table (set during provisioning)
#define SENSOR_ID     "00000000-0000-0000-0000-000000000000"

// ── Hardware pins ─────────────────────────────────────────────────────────────
#define PIN_DHT       4     // DHT22 data pin
#define PIN_RAIN      34    // Rain gauge tipping bucket (analog or interrupt)
#define DHT_TYPE      DHT22

// ── Timing ───────────────────────────────────────────────────────────────────
// Deep-sleep interval between readings (seconds)
// 300 = every 5 minutes
#define SLEEP_SECONDS 300

// ── Debug ─────────────────────────────────────────────────────────────────────
#define SERIAL_BAUD   115200
