"use client";
import { getToken } from "./auth-client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function headers(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: headers() });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiGet  = <T>(path: string) => req<T>(path);
export const apiPost = <T>(path: string, body?: unknown) =>
  req<T>(path, { method: "POST", body: body != null ? JSON.stringify(body) : undefined });
export const apiPatch = <T>(path: string, body?: unknown) =>
  req<T>(path, { method: "PATCH", body: body != null ? JSON.stringify(body) : undefined });

// Auth
export const login = (email: string, password: string) =>
  apiPost<{ access_token: string; role: string }>("/api/v1/auth/login", { email, password });

export const register = (email: string, password: string, name: string, role = "fchv") =>
  apiPost<{ access_token: string; role: string }>("/api/v1/auth/register", { email, password, name, role });

// Missions
export const getMissions = (status?: string) =>
  apiGet<Mission[]>(`/api/v1/missions${status ? `?status=${status}` : ""}`);
export const createMission = (body: { mission_type: string; admin_unit_id: string }) =>
  apiPost<Mission>("/api/v1/missions", body);
export const dispatchMission = (id: string) =>
  apiPost<Mission>(`/api/v1/missions/${id}/dispatch`);

// Detections
export const getDetections = (params?: { detection_type?: string; confidence_min?: number }) => {
  const qs = new URLSearchParams();
  if (params?.detection_type) qs.set("detection_type", params.detection_type);
  if (params?.confidence_min != null) qs.set("confidence_min", String(params.confidence_min));
  return apiGet<Detection[]>(`/api/v1/detections${qs.size ? `?${qs}` : ""}`);
};
export const triggerIntervention = (id: string) =>
  apiPost<{ intervention_mission_id: string }>(`/api/v1/detections/${id}/trigger-intervention`);
export const verifyDetection = (id: string) =>
  apiPost<Detection>(`/api/v1/detections/${id}/verify`);
export const rejectDetection = (id: string, reason?: string) =>
  apiPost<Detection>(`/api/v1/detections/${id}/reject`, { reason });

// Interventions
export const getInterventions = () => apiGet<Intervention[]>("/api/v1/interventions");
export const createIntervention = (body: {
  detection_id?: string;
  mission_id?: string;
  intervention_type: string;
  larvicide_ml?: number;
  operator_notes?: string;
}) => apiPost<Intervention>("/api/v1/interventions", body);

// Alerts
export const getAlerts = () => apiGet<Alert[]>("/api/v1/alerts");
export const acknowledgeAlert = (id: string) =>
  apiPost<{ acknowledged_at: string }>(`/api/v1/alerts/${id}/acknowledge`);

// Predictions
export const getPredictions = () => apiGet<Prediction[]>("/api/v1/predictions");

// Satellite scans
export const getAcquisitions = () => apiGet<Acquisition[]>("/api/v1/satellite/acquisitions");
export const getAcquisitionDetail = (id: string) =>
  apiGet<AcquisitionDetail>(`/api/v1/satellite/acquisitions/${id}`);

// ── Types ──────────────────────────────────────────────────────────────────

export interface Mission {
  id: string;
  mission_type: string;
  status: string;
  planned_at?: string;
  admin_unit_id?: string;
}

export interface Detection {
  id: string;
  detection_type: string;
  confidence: number;
  mission_id: string | null;
  detected_at: string | null;
  lat?: number;
  lng?: number;
  status: string;
}

export interface Intervention {
  id: string;
  intervention_type: string;
  larvicide_ml: number | null;
  executed_at: string | null;
  status?: string;
}

export interface Alert {
  id: string;
  severity: string;
  channel: string;
  recipient_role: string | null;
  admin_unit_name: string | null;
  risk_score: number | null;
  detection_area_sqm: number | null;
  acknowledged_at: string | null;
  created_at: string | null;
}

export interface Prediction {
  id: string;
  admin_unit_id: string;
  risk_score: number;
  uncertainty: number;
  target_horizon: number;
  target_date: string | null;
}

export interface Acquisition {
  id: string;
  admin_unit_id: string;
  admin_unit_name: string | null;
  source: string;
  cloud_cover_pct: number;
  acquired_at: string | null;
  detection_count: number;
  new_site_count: number;
}

export interface AcquisitionDetection {
  id: string;
  detection_type: string;
  confidence: number;
  area_sqm: number | null;
  promoted: string;
  is_new_site: boolean;
  geometry: GeoJSON.Geometry | null;
}

export interface AcquisitionDetail {
  id: string;
  admin_unit_id: string;
  admin_unit_name: string | null;
  source: string;
  cloud_cover_pct: number;
  acquired_at: string | null;
  detections: AcquisitionDetection[];
}
