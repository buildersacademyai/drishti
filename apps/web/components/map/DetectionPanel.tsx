"use client";
import type { Detection, Intervention } from "@/lib/api";

interface Props {
  detection: Detection | null;
  interventions: Intervention[];
  onClose: () => void;
}

const TYPE_COLOR: Record<string, string> = {
  larvae_confirmed: "bg-red-100 text-red-700 border-red-200",
  habitat_confirmed: "bg-amber-100 text-amber-700 border-amber-200",
  water_body: "bg-blue-100 text-blue-700 border-blue-200",
  false_positive: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_COLOR: Record<string, string> = {
  planned: "text-purple-600",
  in_progress: "text-amber-600",
  completed: "text-green-600",
  cancelled: "text-gray-400",
};

export function DetectionPanel({ detection, interventions, onClose }: Props) {
  if (!detection) return null;

  const linked = interventions.filter((i) => i.mission_id === detection.mission_id);

  return (
    <div className="absolute top-4 left-4 z-20 w-80 bg-white rounded-2xl border border-[#e5e7eb] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#1e3a5f] text-white">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5">
            Detection
          </div>
          <div className="font-bold">{detection.detection_type.replace(/_/g, " ")}</div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Type badge */}
        <span
          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${
            TYPE_COLOR[detection.detection_type] ?? "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {detection.detection_type}
        </span>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <Row label="Confidence" value={`${(detection.confidence * 100).toFixed(1)}%`} />
          <Row label="Detected" value={new Date(detection.detected_at).toLocaleString()} />
          <Row label="Location" value={`${detection.lat.toFixed(5)}, ${detection.lng.toFixed(5)}`} />
          {detection.mission_id && (
            <Row label="Mission" value={detection.mission_id.slice(0, 8) + "…"} mono />
          )}
        </div>

        {/* Chain: satellite → drone → intervention */}
        <div className="pt-3 border-t border-[#f3f4f6]">
          <div className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-3">
            Audit chain
          </div>
          <div className="space-y-2">
            <ChainStep icon="🛰️" label="Satellite flagged zone" done />
            <ChainStep icon="🚁" label="Drone survey flight" done />
            <ChainStep icon="🔬" label="Nano-shot confirmation" done={detection.detection_type === "larvae_confirmed"} />
            <ChainStep
              icon="💧"
              label={
                linked.length > 0
                  ? `Intervention: ${linked[0].status}`
                  : "Intervention pending"
              }
              done={linked.some((i) => i.status === "completed")}
              statusColor={linked[0] ? STATUS_COLOR[linked[0].status] : undefined}
            />
          </div>
        </div>

        {/* Linked interventions */}
        {linked.length > 0 && (
          <div className="pt-3 border-t border-[#f3f4f6]">
            <div className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">
              Interventions ({linked.length})
            </div>
            {linked.map((i) => (
              <div key={i.id} className="text-xs text-[#6b7280] flex justify-between">
                <span className={STATUS_COLOR[i.status] ?? ""}>{i.status}</span>
                {i.larvicide_litres && <span>{i.larvicide_litres}L larvicide</span>}
                {i.area_sqm && <span>{i.area_sqm} m²</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[#9ca3af]">{label}</span>
      <span className={`text-[#1a1a2e] text-right ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function ChainStep({
  icon,
  label,
  done,
  statusColor,
}: {
  icon: string;
  label: string;
  done: boolean;
  statusColor?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-base">{icon}</span>
      <span
        className={`text-xs ${
          done
            ? statusColor ?? "text-[#1a1a2e]"
            : "text-[#d1d5db]"
        }`}
      >
        {label}
      </span>
      {done && <span className="ml-auto text-green-500 text-xs">✓</span>}
    </div>
  );
}
