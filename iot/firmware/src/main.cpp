#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include "config.h"

DHT dht(PIN_DHT, DHT_TYPE);

// Rain gauge: counts tip pulses stored in RTC memory across deep-sleep cycles
RTC_DATA_ATTR float rain_mm_accumulated = 0.0f;
// Each tipping bucket tip = 0.2794 mm (standard Davis 0.01-inch gauge)
static const float MM_PER_TIP = 0.2794f;

// ── WiFi ──────────────────────────────────────────────────────────────────────

bool connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("WiFi connecting");
  for (int i = 0; i < 20; i++) {
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println(" OK");
      return true;
    }
    delay(500);
    Serial.print(".");
  }
  Serial.println(" FAILED");
  return false;
}

// ── Sensor read ───────────────────────────────────────────────────────────────

struct Reading {
  float temp_c;
  float humidity_pct;
  float rainfall_mm;
  bool valid;
};

Reading readSensors() {
  Reading r;
  r.temp_c      = dht.readTemperature();
  r.humidity_pct = dht.readHumidity();
  r.rainfall_mm  = rain_mm_accumulated;
  r.valid        = !isnan(r.temp_c) && !isnan(r.humidity_pct);
  return r;
}

// ── API POST ──────────────────────────────────────────────────────────────────

bool postReading(const Reading& r) {
  JsonDocument doc;
  doc["sensor_id"]    = SENSOR_ID;
  doc["temp_c"]       = r.temp_c;
  doc["humidity_pct"] = r.humidity_pct;
  doc["rainfall_mm"]  = r.rainfall_mm;

  JsonObject payload = doc["payload"].to<JsonObject>();
  payload["fw_version"] = "1.0.0";

  String body;
  serializeJson(doc, body);

  String url = String(API_USE_HTTPS ? "https" : "http") +
               "://" + API_HOST + ":" + API_PORT + API_SENSOR_PATH;

#if API_USE_HTTPS
  WiFiClientSecure client;
  client.setInsecure();  // replace with cert fingerprint for production
  HTTPClient http;
  http.begin(client, url);
#else
  HTTPClient http;
  http.begin(url);
#endif

  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + API_TOKEN);

  int code = http.POST(body);
  bool ok  = (code == 201 || code == 200);

  Serial.printf("POST %s → %d\n", url.c_str(), code);
  if (!ok) {
    Serial.println(http.getString());
  }

  http.end();
  return ok;
}

// ── Setup / deep-sleep loop ───────────────────────────────────────────────────

void setup() {
  Serial.begin(SERIAL_BAUD);
  dht.begin();

  // Allow DHT22 to stabilise (needs ≥ 2 s after power-on)
  delay(2000);

  Reading r = readSensors();
  if (!r.valid) {
    Serial.println("DHT22 read failed — sleeping");
    goto sleep;
  }

  Serial.printf("T=%.1f°C  H=%.1f%%  R=%.2fmm\n",
                r.temp_c, r.humidity_pct, r.rainfall_mm);

  if (connectWiFi()) {
    if (postReading(r)) {
      rain_mm_accumulated = 0.0f;  // reset after successful post
    }
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
  }

sleep:
  Serial.printf("Deep sleep %d s\n", SLEEP_SECONDS);
  Serial.flush();
  esp_deep_sleep(static_cast<uint64_t>(SLEEP_SECONDS) * 1000000ULL);
}

void loop() {
  // Never reached — deep-sleep resets into setup()
}
