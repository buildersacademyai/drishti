# Drishti IoT Sensor Node — Bill of Materials

## Per node cost: ~$18–25 USD

| # | Component | Qty | Unit cost | Notes |
|---|---|---|---|---|
| 1 | ESP32 Dev Board (38-pin) | 1 | $4–6 | Any ESP32-WROOM-32 clone |
| 2 | DHT22 temperature/humidity sensor | 1 | $2–3 | AM2302 equivalent |
| 3 | Rain gauge tipping bucket | 1 | $8–12 | Optional — shared with existing weather station |
| 4 | 10kΩ resistor (DHT22 pull-up) | 1 | <$0.01 | |
| 5 | 0.1µF decoupling capacitor | 2 | <$0.01 | Power rail + DHT22 |
| 6 | Solar panel 5V 1W | 1 | $3–5 | Optional for remote sites |
| 7 | 18650 LiPo cell + TP4056 charger | 1 | $2–3 | For battery-backed nodes |
| 8 | Waterproof IP65 junction box | 1 | $3–5 | For outdoor deployment |
| 9 | Micro-USB cable | 1 | $1 | Programming |

## Wiring

```
ESP32 3.3V  ──── DHT22 pin 1 (VCC)
ESP32 GND   ──── DHT22 pin 4 (GND)
ESP32 GPIO4 ──── DHT22 pin 2 (DATA)
                    │
                 10kΩ pull-up to 3.3V

ESP32 GPIO34 ──── Rain gauge signal wire (interrupt-capable pin)
ESP32 GND    ──── Rain gauge GND wire
```

## Software requirements

- PlatformIO IDE (VS Code extension)
- Board: `espressif32` platform, `esp32dev` target
- See `firmware/platformio.ini` for library dependencies

## Provisioning steps

1. Flash firmware via USB: `pio run -t upload`
2. In Drishti API, create sensor record:
   ```bash
   curl -X POST https://api.drishti.health/api/v1/sensors \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"sensor_type_code": "env_dht22", "admin_unit_id": "...", "lat": 27.529, "lng": 84.354}'
   ```
3. Copy returned `sensor_id` UUID into `config.h` → `SENSOR_ID`
4. Get bearer token via `POST /api/v1/auth/login` → copy into `config.h` → `API_TOKEN`
5. Re-flash: `pio run -t upload`
6. Monitor: `pio device monitor` — verify POST 201 responses

## Deployment

- Mount sensor in shaded, ventilated housing (radiation shield) — direct sun causes +5°C bias on DHT22
- Recommended sites: school grounds, health post rooftops, community well areas
- Reading interval: 5 minutes (default) — adjust `SLEEP_SECONDS` in `config.h`
- Rain gauge: install level on concrete base, <5m from sensor node
