"use client";
import { useState, useEffect } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  getInterventions, createIntervention, startIntervention, deleteIntervention, getDetections, apiGet,
  type Intervention, type Detection,
} from "@/lib/client-api";

interface DroneOpt { id: string; name: string; status: string }

const INPUT = "w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30";

const STATUS_COLORS: Record<string, string> = {
  scheduled:  "bg-blue-100 text-blue-700",
  in_progress:"bg-amber-100 text-amber-700",
  completed:  "bg-green-100 text-green-700",
  failed:     "bg-red-100 text-red-700",
};

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [form, setForm] = useState({
    detection_id: "",
    mission_id: "",
    intervention_type: "larvicide",
    larvicide_ml: "",
    operator_notes: "",
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [pending, setPending] = useState<Intervention | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [delErr, setDelErr] = useState<string | null>(null);
  const [showStart, setShowStart] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [drones, setDrones] = useState<DroneOpt[]>([]);
  const [start, setStart] = useState({ detection_id: "", drone_id: "", larvicide_ml: "", operator_notes: "" });
  const [startErr, setStartErr] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("drishti_token");
      if (t) setIsAdmin(JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role === "admin");
    } catch {}
  }, []);

  async function openStart() {
    setShowStart(true);
    setStartErr("");
    try {
      const [d, dr] = await Promise.all([getDetections(), apiGet<DroneOpt[]>("/api/v1/drones")]);
      setDetections(d);
      setDrones(dr.filter((x) => x.status === "at_station"));
    } catch { setStartErr("Couldn't load detections or drones."); }
  }

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    try {
      await deleteIntervention(pending.id);
      setInterventions((xs) => xs.filter((x) => x.id !== pending.id));
      setActionMsg("Intervention deleted.");
      setPending(null);
    } catch {
      setDelErr("Couldn't delete the intervention. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setStarting(true);
    setStartErr("");
    try {
      await startIntervention({
        detection_id: start.detection_id,
        drone_id: start.drone_id,
        larvicide_ml: start.larvicide_ml ? parseFloat(start.larvicide_ml) : undefined,
        operator_notes: start.operator_notes || undefined,
      });
      setShowStart(false);
      setStart({ detection_id: "", drone_id: "", larvicide_ml: "", operator_notes: "" });
      setActionMsg("Intervention started. Drone dispatched.");
      load();
    } catch (err) {
      const m = err instanceof Error ? err.message : "";
      try { setStartErr(JSON.parse(m.slice(m.indexOf("{"))).detail); } catch { setStartErr("Failed to start intervention."); }
    } finally { setStarting(false); }
  }

  async function load() {
    setLoading(true);
    try { setInterventions(await getInterventions()); }
    catch { setInterventions([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createIntervention({
        detection_id: form.detection_id || undefined,
        mission_id: form.mission_id || undefined,
        intervention_type: form.intervention_type,
        larvicide_ml: form.larvicide_ml ? parseFloat(form.larvicide_ml) : undefined,
        operator_notes: form.operator_notes || undefined,
      });
      setShowForm(false);
      setForm({ detection_id: "", mission_id: "", intervention_type: "larvicide", larvicide_ml: "", operator_notes: "" });
      setActionMsg("Intervention logged.");
      load();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0f172a] font-bold text-2xl">Interventions</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Track larvicide and nano-shot treatment operations</p>
        </div>
        <div className="flex gap-2">
        {isAdmin && (
          <button
            onClick={openStart}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            ▶ Start Intervention
          </button>
        )}
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Log Intervention
        </button>
        </div>
      </div>

      {actionMsg && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          {actionMsg}
        </p>
      )}

      {showStart && (
        <form
          onSubmit={handleStart}
          className="mb-6 bg-white border border-[#e2e8f0] rounded-xl p-5 space-y-4 shadow-sm"
        >
          <h2 className="font-semibold text-[#0f172a]">Start Intervention</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#64748b]">Detection</label>
              <select required value={start.detection_id} onChange={(e) => setStart({ ...start, detection_id: e.target.value })} className={INPUT}>
                <option value="">Select detection…</option>
                {detections.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.detection_type.replace("_", " ")} · {(d.confidence * 100).toFixed(0)}% · {d.status} · {d.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#64748b]">Drone (available)</label>
              <select required value={start.drone_id} onChange={(e) => setStart({ ...start, drone_id: e.target.value })} className={INPUT}>
                <option value="">{drones.length ? "Select drone…" : "No drones at station"}</option>
                {drones.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#64748b]">Larvicide (mL)</label>
              <input type="number" value={start.larvicide_ml} onChange={(e) => setStart({ ...start, larvicide_ml: e.target.value })} placeholder="optional" className={INPUT} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#64748b]">Operator Notes</label>
              <input value={start.operator_notes} onChange={(e) => setStart({ ...start, operator_notes: e.target.value })} placeholder="optional" className={INPUT} />
            </div>
          </div>
          {startErr && <p className="text-sm text-red-600">{startErr}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={starting} className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
              {starting ? "Starting…" : "Start"}
            </button>
            <button type="button" onClick={() => setShowStart(false)} className="border border-[#e2e8f0] text-[#64748b] text-sm px-4 py-2 rounded-lg hover:bg-[#f8fafc] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 bg-white border border-[#e2e8f0] rounded-xl p-5 space-y-4 shadow-sm"
        >
          <h2 className="font-semibold text-[#0f172a]">Log Intervention</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#64748b]">Type</label>
              <select
                value={form.intervention_type}
                onChange={(e) => setForm({ ...form, intervention_type: e.target.value })}
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30"
              >
                <option value="larvicide">Larvicide</option>
                <option value="nano_shot">Nano-shot</option>
                <option value="manual_removal">Manual removal</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#64748b]">Larvicide (mL)</label>
              <input
                type="number"
                value={form.larvicide_ml}
                onChange={(e) => setForm({ ...form, larvicide_ml: e.target.value })}
                placeholder="optional"
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#64748b]">Detection ID</label>
              <input
                value={form.detection_id}
                onChange={(e) => setForm({ ...form, detection_id: e.target.value })}
                placeholder="uuid (optional)"
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#64748b]">Mission ID</label>
              <input
                value={form.mission_id}
                onChange={(e) => setForm({ ...form, mission_id: e.target.value })}
                placeholder="uuid (optional)"
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-[#64748b]">Operator Notes</label>
              <textarea
                value={form.operator_notes}
                onChange={(e) => setForm({ ...form, operator_notes: e.target.value })}
                rows={2}
                placeholder="optional notes…"
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-[#0f172a] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors"
            >
              Log
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-[#e2e8f0] text-[#64748b] text-sm px-4 py-2 rounded-lg hover:bg-[#f8fafc] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Larvicide</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Executed</th>
              {isAdmin && <th className="w-12" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-[#64748b]">Loading…</td></tr>
            ) : interventions.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-[#64748b]">No interventions found.</td></tr>
            ) : interventions.map((i) => (
              <tr key={i.id} className="border-b border-[#f3f4f6] hover:bg-[#f8fafc]/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{i.id.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-[#0f172a] font-medium capitalize">{i.intervention_type.replace("_", " ")}</td>
                <td className="px-4 py-3 text-[#64748b] text-sm">{i.larvicide_ml != null ? `${i.larvicide_ml} mL` : "—"}</td>
                <td className="px-4 py-3">
                  {i.status ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[i.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {i.status}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-[#64748b] text-xs">
                  {i.executed_at ? new Date(i.executed_at).toLocaleString() : "—"}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setPending(i)}
                      title="Delete intervention"
                      aria-label="Delete intervention"
                      className="text-[#94a3b8] hover:text-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pending && (
        <ConfirmDialog
          title="Delete intervention?"
          message="This permanently deletes the intervention record. If its drone is still dispatched, the drone is returned to station and the unused mission is removed."
          busy={deleting}
          blocked={delErr}
          onConfirm={confirmDelete}
          onCancel={() => { setPending(null); setDelErr(null); }}
        />
      )}
    </div>
  );
}
