import { Suspense } from "react";
import {
  fetchSatelliteDetections,
  fetchDetections,
  fetchInterventions,
  fetchAlerts,
} from "@/lib/api";
import { MapClient } from "./MapClient";

export const dynamic = "force-dynamic";

export default async function AdminMapPage() {
  const [satellite, detections, interventions, alerts] = await Promise.allSettled([
    fetchSatelliteDetections(),
    fetchDetections(),
    fetchInterventions(),
    fetchAlerts(),
  ]);

  const satelliteData = satellite.status === "fulfilled" ? satellite.value : null;
  const detectionsData = detections.status === "fulfilled" ? detections.value : [];
  const interventionsData = interventions.status === "fulfilled" ? interventions.value : [];
  const alertsData = alerts.status === "fulfilled" ? alerts.value : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-4 border-b border-[#e5e7eb] bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[#1e3a5f] font-bold text-xl">Live Map</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">Real-time satellite patches, drone detections, and interventions</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#6b7280]">
          <span>Patches: <strong className="text-[#1e3a5f]">{satelliteData?.features?.length ?? 0}</strong></span>
          <span>Detections: <strong className="text-[#1e3a5f]">{detectionsData.length}</strong></span>
          <span>Interventions: <strong className="text-[#1e3a5f]">{interventionsData.length}</strong></span>
          {alertsData.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#f59e0b] text-[#050d1a] font-semibold text-xs">
              {alertsData.length} alert{alertsData.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-[#6b7280]">Loading map…</div>}>
          <MapClient
            satelliteGeoJSON={satelliteData}
            detections={detectionsData}
            interventions={interventionsData}
          />
        </Suspense>
      </div>
    </div>
  );
}
