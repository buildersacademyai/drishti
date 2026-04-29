# Drishti — Ethics and Data Governance

## Principles

Drishti handles health and location data about communities in climate-vulnerable settings. We hold ourselves to a higher standard than minimum legal compliance — not because we are required to, but because these communities deserve it.

**Core commitments:**
1. Data serves health outcomes, not commercial extraction.
2. Community members are partners, not data subjects.
3. No data leaves the country without explicit governmental agreement.
4. All code and methods are open-source and auditable.
5. We collect the minimum data necessary to achieve the health objective.

---

## What We Collect

### Satellite imagery
- **Source:** Sentinel-2 (ESA Copernicus) — publicly available, no individual-level data.
- **Processing:** NDWI water index computation on district-level tiles. No personally identifiable information (PII).
- **Retention:** Derived GeoJSON stored indefinitely for trend analysis. Raw tiles cached for 90 days.

### Drone imagery
- **Coverage:** Water surfaces and potential larval habitats at 5–10cm GSD.
- **Privacy risk:** Images captured from 2–30m altitude may incidentally include people, vehicles, or private property.
- **Mitigation:**
  - Pre-flight community notification required via local FCHV network and ward office.
  - Imagery reviewed for incidental PII; faces and vehicle plates automatically blurred before storage.
  - Imagery access restricted to authenticated operators and health officers with a stated purpose.
  - Retention: 12 months for survey imagery; nano-shot crops retained as long as model is in production (training data).
  - No drone imagery shared with third parties without written consent of the relevant district health office.

### IoT sensor readings
- **Content:** Temperature, humidity, rainfall — environmental data only.
- **Location:** Sensors installed at schools and health posts (non-residential, public locations).
- **No individual tracking.** Sensors have no unique identifiers linkable to individuals.

### Health case data
- **Source:** EDCD published reports and aggregated FCHV case logs.
- **Level:** Aggregate counts at ward or municipality level — never individual case records.
- **No patient records** are ingested or stored in MVP.

### Dashboard users
- **Minimal registration:** Name, role, admin unit, locale, contact for alerts.
- **No tracking:** No analytics beyond operational logs (who accessed which patient/case records).
- **Password storage:** bcrypt hash only.

---

## Data Sovereignty

Nepal's mid-hill districts are the pilot geography. Data sovereignty requirements:

- **All data resides in-country** for operational deployments. MinIO on a Nepal-hosted VPS is the default; AWS is only used for ML training with anonymized aggregate datasets.
- **No data transferred to third-party platforms** (including cloud AI services) without EDCD approval and a signed data-sharing agreement.
- **Platform can be deployed fully air-gapped** — the architecture has no hard dependency on external APIs in operation. Google Earth Engine is used for satellite pre-processing in development; a `sen2cor` + local `rasterio` pipeline is documented as the offline alternative.

---

## Community Consent

Vector surveillance affects communities directly. Our consent protocol:

1. **Ward-level notification** before any drone flight: district health office notifies ward chairs and FCHVs at least 48 hours in advance.
2. **Opt-out mechanism:** Ward chairs can request specific areas be excluded from drone coverage. Exclusion polygons are stored in the platform and enforced in mission planning.
3. **Results shared back:** After each survey cycle, anonymized results (water body locations, risk scores) are provided to the relevant ward in a plain-language format in Nepali.
4. **No covert surveillance.** Drone operations are never conducted without prior community notification.

---

## Access Control

| Role | Can access |
|---|---|
| `fchv` | Own ward: risk scores, active alerts, intervention status |
| `health_officer` | Assigned district: all data within district |
| `admin` | Tenant scope: all data, user management |
| `operator` | Drone flights and missions only |
| System | All (Celery workers, no human login) |

**All API endpoints require authentication** (JWT, 24-hour expiry). Audit log records every write action with actor, timestamp, and before/after payload.

---

## Third-Party Data Sharing

We do not sell or license community health or location data to any third party. Authorized sharing:

| Recipient | Conditions | Data shared |
|---|---|---|
| EDCD (Nepal) | MOU, default partner | Aggregated detection + prediction summaries |
| UNICEF | Grant reporting | Anonymized aggregate outcomes only |
| Academic partners | Signed DUA, IRB approval | Anonymized datasets with ward-level aggregation |
| Open-source community | Apache 2.0 | Code only — no production data |

---

## Algorithmic Fairness

The prediction model scores ward-level outbreak risk. Risks of unfair outcomes:

- **Misallocation of interventions:** Low-risk scores in under-surveyed wards may reflect data absence, not true low risk. Mitigation: uncertainty bands are displayed alongside risk scores; health officers are trained to interpret uncertainty.
- **Feedback loops:** Frequent intervention in high-risk wards creates more training data from those wards, potentially biasing future predictions. Mitigation: spatial cross-validation holdouts in training; active monitoring of prediction calibration across ward types.
- **Historical bias in case data:** Historically under-reported wards (remote, low health-post density) may have lower apparent case burdens. Mitigation: case data is treated as a weak signal; satellite and drone data (geography-blind) drive primary detection.

---

## Open-Source Auditability

All model code, training scripts, and feature engineering pipelines are open-source under Apache 2.0. This enables:

- Independent audit of algorithmic decisions.
- Academic replication and critique.
- Community contributions to improve fairness and accuracy.

Model artifacts (trained weights) are published with their training data provenance documented in the `models` table. Model deprecation is tracked — no silent replacement of production models.

---

## Legal Compliance

| Requirement | Status |
|---|---|
| Nepal Privacy Act 2018 | Compliant — data minimization, consent, access controls |
| EDCD data-sharing agreement | Pending (in active discussion) |
| Nepal Civil Aviation Authority drone permit | Obtained for pilot district |
| IRB/ethics review (TU-IOM) | In progress for academic partnership |

---

## Incident Response

If a data breach, unauthorized access, or privacy incident occurs:

1. Revoke affected credentials immediately.
2. Notify the relevant district health office within 24 hours.
3. Notify EDCD within 72 hours.
4. Document the incident in the audit log.
5. For incidents affecting personal data: notify UNICEF within 72 hours (grant requirement).
6. Publish a post-incident report on the GitHub repository within 30 days.

Report security vulnerabilities per [SECURITY.md](../SECURITY.md).

---

*Last reviewed: April 2026. Review schedule: quarterly, or following any significant change in data collection scope.*
