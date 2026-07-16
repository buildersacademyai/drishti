"use client";
import { useState } from "react";
import type { Detection, Intervention } from "@/lib/api";
import { verifyDetection, rejectDetection } from "@/lib/client-api";

interface Props {
  detection: Detection | null;
  interventions: Intervention[];
  onClose: () => void;
  onStatusChange?: (id: string, status: string) => void;
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

export function DetectionPanel({ detection, interventions, onClose, onStatusChange }: Props) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!detection) return null;

  const linked = interventions.filter((i) => i.mission_id === detection.mission_id);

  async function handleVerify() {
    setError(null);
    setBusy(true);
    try {
      await verifyDetection(detection!.id);
      onStatusChange?.(detection!.id, "verified");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify detection");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    setError(null);
    setBusy(true);
    try {
      await rejectDetection(detection!.id, reason || undefined);
      onStatusChange?.(detection!.id, "rejected");
      setRejecting(false);
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject detection");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="absolute top-4 left-4 z-20 w-80 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#0f172a] text-white">
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
          <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-3">
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

        {detection.status === "pending_review" && (
          <div className="pt-3 border-t border-[#f3f4f6]">
            {error && (
              <div className="text-xs text-red-600 mb-3 px-2.5 py-2 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            {!rejecting ? (
              <div className="flex gap-3">
                <button
                  disabled={busy}
                  onClick={handleVerify}
                  className="flex-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg py-2 transition-colors disabled:opacity-50"
                >
                  Verify
                </button>
                <button
                  disabled={busy}
                  onClick={() => setRejecting(true)}
                  className="flex-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="w-full border border-[#e2e8f0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30"
                />
                <div className="flex gap-2">
                  <button disabled={busy} onClick={handleReject} className="flex-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg py-1.5">Confirm reject</button>
                  <button disabled={busy} onClick={() => { setRejecting(false); setReason(""); }} className="text-xs text-gray-400 px-2">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Linked interventions */}
        {linked.length > 0 && (
          <div className="pt-3 border-t border-[#f3f4f6]">
            <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
              Interventions ({linked.length})
            </div>
            {linked.map((i) => (
              <div key={i.id} className="text-xs text-[#64748b] flex justify-between">
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
      <span className="text-[#94a3b8]">{label}</span>
      <span className={`text-[#0f172a] text-right ${mono ? "font-mono text-xs" : ""}`}>
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
            ? statusColor ?? "text-[#0f172a]"
            : "text-[#cbd5e1]"
        }`}
      >
        {label}
      </span>
      {done && <span className="ml-auto text-green-500 text-xs">✓</span>}
    </div>
  );
}
