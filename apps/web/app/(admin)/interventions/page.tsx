"use client";
import { useState, useEffect } from "react";
import { getInterventions, createIntervention, type Intervention } from "@/lib/client-api";

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
          <h1 className="text-[#1e3a5f] font-bold text-2xl">Interventions</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">Track larvicide and nano-shot treatment operations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#1e3a5f] hover:bg-[#152d4d] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Log Intervention
        </button>
      </div>

      {actionMsg && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          {actionMsg}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 bg-white border border-[#e5e7eb] rounded-xl p-5 space-y-4 shadow-sm"
        >
          <h2 className="font-semibold text-[#1e3a5f]">Log Intervention</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6b7280]">Type</label>
              <select
                value={form.intervention_type}
                onChange={(e) => setForm({ ...form, intervention_type: e.target.value })}
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
              >
                <option value="larvicide">Larvicide</option>
                <option value="nano_shot">Nano-shot</option>
                <option value="manual_removal">Manual removal</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6b7280]">Larvicide (mL)</label>
              <input
                type="number"
                value={form.larvicide_ml}
                onChange={(e) => setForm({ ...form, larvicide_ml: e.target.value })}
                placeholder="optional"
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6b7280]">Detection ID</label>
              <input
                value={form.detection_id}
                onChange={(e) => setForm({ ...form, detection_id: e.target.value })}
                placeholder="uuid (optional)"
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6b7280]">Mission ID</label>
              <input
                value={form.mission_id}
                onChange={(e) => setForm({ ...form, mission_id: e.target.value })}
                placeholder="uuid (optional)"
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-[#6b7280]">Operator Notes</label>
              <textarea
                value={form.operator_notes}
                onChange={(e) => setForm({ ...form, operator_notes: e.target.value })}
                rows={2}
                placeholder="optional notes…"
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-[#1e3a5f] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#152d4d] transition-colors"
            >
              Log
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-[#e5e7eb] text-[#6b7280] text-sm px-4 py-2 rounded-lg hover:bg-[#f8f7f4] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f8f7f4]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Larvicide</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Executed</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6b7280]">Loading…</td></tr>
            ) : interventions.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6b7280]">No interventions found.</td></tr>
            ) : interventions.map((i) => (
              <tr key={i.id} className="border-b border-[#f3f4f6] hover:bg-[#f8f7f4]/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">{i.id.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-[#1e3a5f] font-medium capitalize">{i.intervention_type.replace("_", " ")}</td>
                <td className="px-4 py-3 text-[#6b7280] text-sm">{i.larvicide_ml != null ? `${i.larvicide_ml} mL` : "—"}</td>
                <td className="px-4 py-3">
                  {i.status ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[i.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {i.status}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-[#6b7280] text-xs">
                  {i.executed_at ? new Date(i.executed_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
