"use client";
import { useEffect, useState } from "react";
import { apiGet, startIntervention, type Detection } from "@/lib/client-api";

interface DroneOpt { id: string; name: string; status: string }

const INPUT = "w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30";

export default function StartInterventionModal({
  detection,
  onClose,
  onStarted,
}: {
  detection: Detection;
  onClose: () => void;
  onStarted: () => void;
}) {
  const [drones, setDrones] = useState<DroneOpt[]>([]);
  const [form, setForm] = useState({ drone_id: "", larvicide_ml: "", operator_notes: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiGet<DroneOpt[]>("/api/v1/drones")
      .then((d) => setDrones(d.filter((x) => x.status === "at_station")))
      .catch(() => setErr("Couldn't load drones."));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await startIntervention({
        detection_id: detection.id,
        drone_id: form.drone_id,
        larvicide_ml: form.larvicide_ml ? parseFloat(form.larvicide_ml) : undefined,
        operator_notes: form.operator_notes || undefined,
      });
      onStarted();
    } catch (e2) {
      const m = e2 instanceof Error ? e2.message : "";
      try { setErr(JSON.parse(m.slice(m.indexOf("{"))).detail); } catch { setErr("Failed to start intervention."); }
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !busy && onClose()}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl space-y-4"
      >
        <h2 className="text-[#0f172a] font-bold text-lg">Start intervention</h2>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#64748b]">Detection</label>
          <select disabled value={detection.id} className={`${INPUT} bg-[#f8fafc]`}>
            <option value={detection.id}>
              {detection.detection_type.replace("_", " ")} · {(detection.confidence * 100).toFixed(0)}% · {detection.status} · {detection.id.slice(0, 8)}
            </option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#64748b]">Drone (available)</label>
          <select required autoFocus value={form.drone_id} onChange={(e) => setForm({ ...form, drone_id: e.target.value })} className={INPUT}>
            <option value="">{drones.length ? "Select drone…" : "No drones at station"}</option>
            {drones.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#64748b]">Larvicide (mL)</label>
            <input type="number" value={form.larvicide_ml} onChange={(e) => setForm({ ...form, larvicide_ml: e.target.value })} placeholder="optional" className={INPUT} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#64748b]">Operator notes</label>
            <input value={form.operator_notes} onChange={(e) => setForm({ ...form, operator_notes: e.target.value })} placeholder="optional" className={INPUT} />
          </div>
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" disabled={busy} onClick={onClose} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={busy || !form.drone_id} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
            {busy ? "Starting…" : "Start"}
          </button>
        </div>
      </form>
    </div>
  );
}
