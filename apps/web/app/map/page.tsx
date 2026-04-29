import { Suspense } from "react";
import {
  fetchSatelliteDetections,
  fetchDetections,
  fetchInterventions,
  fetchAlerts,
} from "@/lib/api";
import { MapClient } from "./MapClient";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const [satellite, detections, interventions, alerts] = await Promise.allSettled([
    fetchSatelliteDetections(),
    fetchDetections(),
    fetchInterventions(),
    fetchAlerts(),
  ]);

  const satelliteData =
    satellite.status === "fulfilled" ? satellite.value : null;
  const detectionsData =
    detections.status === "fulfilled" ? detections.value : [];
  const interventionsData =
    interventions.status === "fulfilled" ? interventions.value : [];
  const alertsData = alerts.status === "fulfilled" ? alerts.value : [];

  return (
    <div className="flex flex-col h-screen bg-[#f8f7f4]">
      {/* Top bar */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-6 bg-[#1e3a5f] text-white shadow-md z-20">
        <span className="font-bold text-lg tracking-tight">Drishti</span>
        <div className="flex items-center gap-4 text-sm">
          {alertsData.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#f59e0b] text-[#1a1a2e] font-semibold">
              {alertsData.length} alert{alertsData.length !== 1 ? "s" : ""}
            </span>
          )}
          <a
            href="/"
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            ← Landing
          </a>
        </div>
      </header>

      {/* Map area */}
      <div className="flex-1 relative">
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-[#6b7280]">Loading map…</div>}>
          <MapClient
            satelliteGeoJSON={satelliteData}
            detections={detectionsData}
            interventions={interventionsData}
          />
        </Suspense>
      </div>

      {/* Bottom stats bar */}
      <footer className="flex-shrink-0 h-10 flex items-center gap-6 px-6 bg-white border-t border-[#e5e7eb] text-xs text-[#6b7280]">
        <span>Satellite patches: {satelliteData?.features?.length ?? 0}</span>
        <span>Detections: {detectionsData.length}</span>
        <span>Interventions: {interventionsData.length}</span>
      </footer>
    </div>
  );
}
