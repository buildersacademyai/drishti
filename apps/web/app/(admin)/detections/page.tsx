"use client";
import { useState, useEffect } from "react";
import { getDetections, triggerIntervention, type Detection } from "@/lib/client-api";

const TYPE_COLORS: Record<string, string> = {
  larval_habitat: "bg-red-100 text-red-700",
  stagnant_water: "bg-blue-100 text-blue-700",
  adult_mosquito: "bg-purple-100 text-purple-700",
};

export default function DetectionsPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [confMin, setConfMin] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await getDetections({
        detection_type: typeFilter || undefined,
        confidence_min: confMin ? parseFloat(confMin) : undefined,
      });
      setDetections(data);
    } catch {
      setDetections([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [typeFilter, confMin]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleTrigger(id: string) {
    try {
      const res = await triggerIntervention(id);
      setActionMsg(`Intervention mission created: ${res.intervention_mission_id.slice(0, 8)}…`);
      load();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  const confBadge = (c: number) => {
    if (c >= 0.85) return "text-green-700";
    if (c >= 0.6) return "text-amber-700";
    return "text-red-700";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[#1e3a5f] font-bold text-2xl">Detections</h1>
        <p className="text-[#6b7280] text-sm mt-0.5">Larval habitats and threats identified by drone survey</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex gap-1.5">
          {["", "larval_habitat", "stagnant_water", "adult_mosquito"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#1e3a5f]"
              }`}
            >
              {t === "" ? "All Types" : t.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-[#6b7280]">Min confidence</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={confMin}
            onChange={(e) => setConfMin(e.target.value)}
            placeholder="0.0"
            className="w-20 border border-[#e5e7eb] rounded-lg px-2 py-1.5 text-xs text-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
          />
        </div>
      </div>

      {actionMsg && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          {actionMsg}
        </p>
      )}

      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f8f7f4]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Confidence</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Location</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Detected</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6b7280]">Loading…</td></tr>
            ) : detections.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6b7280]">No detections found.</td></tr>
            ) : detections.map((d) => (
              <tr key={d.id} className="border-b border-[#f3f4f6] hover:bg-[#f8f7f4]/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">{d.id.slice(0, 8)}…</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[d.detection_type] ?? "bg-gray-100 text-gray-600"}`}>
                    {d.detection_type.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-semibold text-xs ${confBadge(d.confidence)}`}>
                    {(d.confidence * 100).toFixed(1)}%
                  </span>
                  <div className="w-16 h-1 bg-[#e5e7eb] rounded-full mt-1">
                    <div
                      className="h-1 rounded-full bg-[#f59e0b]"
                      style={{ width: `${d.confidence * 100}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-[#6b7280] font-mono">
                  {d.lat != null && d.lng != null
                    ? `${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-[#6b7280] text-xs">
                  {d.detected_at ? new Date(d.detected_at).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleTrigger(d.id)}
                    className="text-xs font-semibold text-[#f59e0b] hover:text-[#d97706] transition-colors"
                  >
                    Trigger →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
