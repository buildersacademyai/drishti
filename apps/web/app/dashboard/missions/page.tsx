"use client";
import { useState, useEffect } from "react";
import {
  getMissions,
  createMission,
  dispatchMission,
  type Mission,
} from "@/lib/client-api";

const STATUS_COLORS: Record<string, string> = {
  planned:    "bg-blue-100 text-blue-700",
  dispatched: "bg-amber-100 text-amber-700",
  in_flight:  "bg-purple-100 text-purple-700",
  completed:  "bg-green-100 text-green-700",
  aborted:    "bg-red-100 text-red-700",
};

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ mission_type: "survey", admin_unit_id: "" });
  const [actionMsg, setActionMsg] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await getMissions(statusFilter || undefined);
      setMissions(data);
    } catch {
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createMission(form);
      setShowForm(false);
      setForm({ mission_type: "survey", admin_unit_id: "" });
      setActionMsg("Mission created.");
      load();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  async function handleDispatch(id: string) {
    try {
      await dispatchMission(id);
      setActionMsg("Mission dispatched.");
      load();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0f172a] font-bold text-2xl">Missions</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Manage survey and intervention drone missions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Mission
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {["", "planned", "dispatched", "in_flight", "completed", "aborted"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-[#0f172a] text-white"
                : "bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            {s === "" ? "All" : s}
          </button>
        ))}
      </div>

      {actionMsg && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          {actionMsg}
        </p>
      )}

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 bg-white border border-[#e2e8f0] rounded-xl p-5 space-y-4 shadow-sm"
        >
          <h2 className="font-semibold text-[#0f172a]">New Mission</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#64748b]">Type</label>
              <select
                value={form.mission_type}
                onChange={(e) => setForm({ ...form, mission_type: e.target.value })}
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30"
              >
                <option value="survey">Survey</option>
                <option value="intervention">Intervention</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#64748b]">Admin Unit ID</label>
              <input
                required
                value={form.admin_unit_id}
                onChange={(e) => setForm({ ...form, admin_unit_id: e.target.value })}
                placeholder="uuid"
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-[#0f172a] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors"
            >
              Create
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

      {/* Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Planned At</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#64748b]">Loading…</td></tr>
            ) : missions.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#64748b]">No missions found.</td></tr>
            ) : missions.map((m) => (
              <tr key={m.id} className="border-b border-[#f3f4f6] hover:bg-[#f8fafc]/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{m.id.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-[#0f172a] font-medium capitalize">{m.mission_type}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[m.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#64748b]">
                  {m.planned_at ? new Date(m.planned_at).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  {m.status === "planned" && (
                    <button
                      onClick={() => handleDispatch(m.id)}
                      className="text-xs font-semibold text-[#10b981] hover:text-[#059669] transition-colors"
                    >
                      Dispatch →
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
