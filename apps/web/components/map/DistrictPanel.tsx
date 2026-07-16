"use client";
import type { Detection, Intervention } from "@/lib/api";

export interface SelectedDistrict {
  name: string;
  risk: number | null;
  bounds: [[number, number], [number, number]];
}

interface Props {
  district: SelectedDistrict;
  detections: Detection[];
  interventions: Intervention[];
  satelliteGeoJSON?: GeoJSON.FeatureCollection | null;
  onClose: () => void;
}

// Cheap representative point for a Polygon/MultiPolygon — first vertex of the
// first ring. Matches the same loose bbox-membership approach used below.
function representativePoint(geometry: GeoJSON.Geometry): [number, number] | null {
  if (geometry.type === "Polygon") return geometry.coordinates[0]?.[0] as [number, number];
  if (geometry.type === "MultiPolygon") return geometry.coordinates[0]?.[0]?.[0] as [number, number];
  return null;
}

function riskLabel(r: number) {
  if (r >= 0.75) return { text: "High", color: "bg-red-100 text-red-700 border-red-200" };
  if (r >= 0.50) return { text: "Medium", color: "bg-amber-100 text-amber-700 border-amber-200" };
  if (r >= 0.25) return { text: "Low", color: "bg-lime-100 text-lime-700 border-lime-200" };
  return { text: "Negligible", color: "bg-gray-100 text-gray-500 border-gray-200" };
}

function inBounds(
  lat: number,
  lng: number,
  bounds: [[number, number], [number, number]]
) {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

export function DistrictPanel({ district, detections, interventions, satelliteGeoJSON, onClose }: Props) {
  const localDetections = detections.filter(
    (d) => d.lat != null && d.lng != null && inBounds(d.lat, d.lng, district.bounds)
  );
  const localInterventions = interventions.filter(
    (i) => i.lat != null && i.lng != null && inBounds(i.lat, i.lng, district.bounds)
  );
  const localWaterSources = (satelliteGeoJSON?.features ?? []).filter((f) => {
    const point = representativePoint(f.geometry);
    return point ? inBounds(point[1], point[0], district.bounds) : false;
  });

  const highConf = localDetections.filter((d) => d.confidence >= 0.8).length;
  const completedInt = localInterventions.filter((i) => i.status === "completed").length;

  const rl = district.risk != null ? riskLabel(district.risk) : null;

  return (
    <div className="absolute top-4 left-4 z-20 w-72 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#0f172a] text-white">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5">District</div>
          <div className="font-bold text-lg capitalize">{district.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Risk badge */}
        {rl && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94a3b8] font-medium">Malaria Risk</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(district.risk ?? 0) * 100}%`,
                    backgroundColor: rl.text === "High" ? "#ef4444" : rl.text === "Medium" ? "#f59e0b" : "#84cc16",
                  }}
                />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${rl.color}`}>
                {rl.text} {district.risk != null ? `(${(district.risk * 100).toFixed(0)}%)` : ""}
              </span>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <Stat value={localWaterSources.length} label="Water Sources" color="text-[#0ea5e9]" />
          <Stat value={localDetections.length} label="Detections" color="text-[#38bdf8]" />
          <Stat value={highConf} label="High conf." color="text-red-500" />
          <Stat value={localInterventions.length} label="Interventions" color="text-blue-500" />
          <Stat value={completedInt} label="Completed" color="text-green-500" />
        </div>

        {/* Detection breakdown */}
        {localDetections.length > 0 && (
          <div className="border-t border-[#f3f4f6] pt-4 space-y-2">
            <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
              Detection Types
            </div>
            {Object.entries(
              localDetections.reduce<Record<string, number>>((acc, d) => {
                acc[d.detection_type] = (acc[d.detection_type] ?? 0) + 1;
                return acc;
              }, {})
            ).map(([type, count]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-[#64748b] capitalize">{type.replace(/_/g, " ")}</span>
                <span className="font-semibold text-[#0f172a]">{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Intervention status */}
        {localInterventions.length > 0 && (
          <div className="border-t border-[#f3f4f6] pt-4 space-y-2">
            <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
              Intervention Status
            </div>
            {Object.entries(
              localInterventions.reduce<Record<string, number>>((acc, i) => {
                acc[i.status] = (acc[i.status] ?? 0) + 1;
                return acc;
              }, {})
            ).map(([status, count]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-[#64748b] capitalize">{status.replace(/_/g, " ")}</span>
                <span className="font-semibold text-[#0f172a]">{count}</span>
              </div>
            ))}
          </div>
        )}

        {localDetections.length === 0 && localInterventions.length === 0 && (
          <p className="text-xs text-[#94a3b8] text-center py-2">No field data for this district yet.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-[#f8fafc] rounded-xl p-3 text-center">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-[10px] text-[#94a3b8] uppercase tracking-wide mt-0.5">{color && label}</div>
    </div>
  );
}
