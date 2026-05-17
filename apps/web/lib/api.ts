const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
  } catch {
    throw new Error(`API unreachable: ${path}`);
  }
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface SatelliteDetection {
  id: string;
  mission_id: string | null;
  detected_at: string;
  ndwi_score: number;
  geojson: GeoJSON.Feature;
}

export interface Detection {
  id: string;
  mission_id: string | null;
  detection_type: string;
  confidence: number;
  lat: number;
  lng: number;
  detected_at: string;
}

export interface Intervention {
  id: string;
  mission_id: string | null;
  status: string;
  larvicide_litres: number | null;
  area_sqm: number | null;
  lat: number;
  lng: number;
  created_at: string;
}

export interface RiskPrediction {
  id: string;
  admin_unit_id: string;
  risk_score: number;
  horizon_days: number;
  predicted_at: string;
}

export interface Alert {
  id: string;
  title: string;
  body: string;
  severity: "low" | "medium" | "high" | "critical";
  created_at: string;
}

// ── Fetchers ───────────────────────────────────────────────────────────────

export const fetchSatelliteDetections = () =>
  get<{ type: "FeatureCollection"; features: GeoJSON.Feature[] }>(
    "/api/v1/satellite-detections"
  );

export const fetchDetections = (params?: {
  detection_type?: string;
  confidence_min?: number;
}) => {
  const qs = new URLSearchParams();
  if (params?.detection_type) qs.set("detection_type", params.detection_type);
  if (params?.confidence_min != null)
    qs.set("confidence_min", String(params.confidence_min));
  return get<Detection[]>(`/api/v1/detections${qs.size ? `?${qs}` : ""}`);
};

export const fetchInterventions = () => get<Intervention[]>("/api/v1/interventions");

export const fetchPredictions = (adminUnitId?: string) => {
  const qs = adminUnitId ? `?admin_unit_id=${adminUnitId}` : "";
  return get<RiskPrediction[]>(`/api/v1/predictions${qs}`);
};

export const fetchAlerts = () => get<Alert[]>("/api/v1/alerts/active");

// ── Server-side dashboard fetchers ────────────────────────────────────────

export interface MissionServer {
  id: string;
  mission_type: string;
  status: string;
  planned_at?: string;
  admin_unit_id?: string;
}

export interface AlertServer {
  id: string;
  severity: string;
  channel: string;
  recipient_role: string | null;
  acknowledged_at: string | null;
  created_at: string | null;
}

export interface DroneServer {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  status: string;
  battery_pct: number | null;
  total_flight_hours: number;
  last_seen: string | null;
  current_mission_id: string | null;
}

export const getMissionsServer = () => get<MissionServer[]>("/api/v1/missions");
export const getDetectionsServer = () => get<Detection[]>("/api/v1/detections");
export const getInterventionsServer = () => get<Intervention[]>("/api/v1/interventions");
export const getAlertsServer = () => get<AlertServer[]>("/api/v1/alerts");
export const getDronesServer = () => get<DroneServer[]>("/api/v1/drones");
