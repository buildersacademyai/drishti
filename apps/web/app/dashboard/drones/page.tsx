"use client";
import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/client-api";

interface Drone {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  connection_string: string;
  status: string;
  battery_pct: number | null;
  total_flight_hours: number;
  last_seen: string | null;
  current_mission_id: string | null;
  home_lat: number | null;
  home_lng: number | null;
  current_lat: number | null;
  current_lng: number | null;
  notes: string;
  registered_at: string | null;
}

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  at_station:  { label: "At Station",  color: "bg-green-100 text-green-700 border-green-200",   dot: "bg-green-500" },
  in_field:    { label: "In Field",    color: "bg-blue-100 text-blue-700 border-blue-200",     dot: "bg-blue-500" },
  charging:    { label: "Charging",    color: "bg-amber-100 text-amber-700 border-amber-200",  dot: "bg-amber-400" },
  maintenance: { label: "Maintenance", color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  offline:     { label: "Offline",     color: "bg-gray-100 text-gray-500 border-gray-200",     dot: "bg-gray-400" },
};

const ALL_STATUSES = Object.keys(STATUS_META);

function BatteryBar({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-[#94a3b8] text-xs">—</span>;
  const color = pct >= 60 ? "#22c55e" : pct >= 25 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{pct}%</span>
    </div>
  );
}

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Drone | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", model: "", serial_number: "", home_lat: "", home_lng: "", notes: "" });
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({ name: "", model: "", serial_number: "", home_lat: "", home_lng: "", notes: "", connection_string: "" });

  async function load() {
    setLoading(true);
    try { setDrones(await apiGet<Drone[]>("/api/v1/drones")); }
    catch { setDrones([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Re-select updated drone after reload
  useEffect(() => {
    if (selected) setSelected(drones.find(d => d.id === selected.id) ?? null);
  }, [drones]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiPost("/api/v1/drones", {
        name: form.name,
        model: form.model || undefined,
        serial_number: form.serial_number || undefined,
        home_lat: form.home_lat ? parseFloat(form.home_lat) : undefined,
        home_lng: form.home_lng ? parseFloat(form.home_lng) : undefined,
        notes: form.notes || undefined,
        connection_string: form.connection_string || undefined,
      });
      setShowForm(false);
      setForm({ name: "", model: "", serial_number: "", home_lat: "", home_lng: "", notes: "", connection_string: "" });
      setMsg({ text: "Drone registered.", ok: true });
      load();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Failed", ok: false });
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await apiPatch(`/api/v1/drones/${id}`, { status });
      setMsg({ text: `Status updated to ${status}.`, ok: true });
      load();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Failed", ok: false });
    }
  }

  async function handleBatteryUpdate(id: string, pct: number) {
    try {
      await apiPatch(`/api/v1/drones/${id}`, { battery_pct: pct });
      setMsg({ text: "Battery updated.", ok: true });
      load();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Failed", ok: false });
    }
  }

  async function handleConnectionStringUpdate(id: string, connectionString: string) {
    try {
      await apiPatch(`/api/v1/drones/${id}`, { connection_string: connectionString });
      setMsg({ text: "Connection string updated.", ok: true });
      load();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Failed", ok: false });
    }
  }

  function startEditing(d: Drone) {
    setEditForm({
      name: d.name,
      model: d.model,
      serial_number: d.serial_number,
      home_lat: d.home_lat != null ? String(d.home_lat) : "",
      home_lng: d.home_lng != null ? String(d.home_lng) : "",
      notes: d.notes,
    });
    setEditing(true);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    try {
      await apiPatch(`/api/v1/drones/${selected.id}`, {
        name: editForm.name,
        model: editForm.model,
        serial_number: editForm.serial_number,
        home_lat: editForm.home_lat ? parseFloat(editForm.home_lat) : undefined,
        home_lng: editForm.home_lng ? parseFloat(editForm.home_lng) : undefined,
        notes: editForm.notes,
      });
      setMsg({ text: "Drone details updated.", ok: true });
      setEditing(false);
      load();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Failed", ok: false });
    }
  }

  const counts = ALL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = drones.filter(d => d.status === s).length;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0f172a] font-bold text-2xl">Drone Control Center</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Manage fleet, monitor status, update telemetry</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Register Drone
        </button>
      </div>

      {/* Fleet summary */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-[#0f172a]">{drones.length}</p>
          <p className="text-xs text-[#94a3b8] uppercase tracking-wide mt-1">Total Fleet</p>
        </div>
        {ALL_STATUSES.map(s => {
          const m = STATUS_META[s];
          return (
            <div key={s} className="bg-white border border-[#e2e8f0] rounded-xl p-4 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                <p className="text-xl font-black text-[#0f172a]">{counts[s]}</p>
              </div>
              <p className="text-xs text-[#94a3b8]">{m.label}</p>
            </div>
          );
        })}
      </div>

      {msg && (
        <p className={`text-sm rounded-lg px-4 py-2 border ${msg.ok ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
          {msg.text}
        </p>
      )}

      {/* Register form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#0f172a]">Register New Drone</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Name *", key: "name", placeholder: "Eagle-1" },
              { label: "Model", key: "model", placeholder: "DJI Matrice 300 RTK" },
              { label: "Serial Number", key: "serial_number", placeholder: "SN-123456" },
              { label: "Home Lat", key: "home_lat", placeholder: "27.529" },
              { label: "Home Lng", key: "home_lng", placeholder: "84.354" },
              { label: "Connection String", key: "connection_string", placeholder: "udp:127.0.0.1:14550" },
              { label: "Notes", key: "notes", placeholder: "optional" },
            ].map(f => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs font-medium text-[#64748b]">{f.label}</label>
                <input
                  required={f.key === "name"}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#0f172a] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1e293b]">Register</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-[#e2e8f0] text-[#64748b] text-sm px-4 py-2 rounded-lg hover:bg-[#f8fafc]">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* Drone cards */}
        <div className="col-span-2 space-y-3">
          {loading ? (
            <p className="text-center text-[#64748b] py-12">Loading…</p>
          ) : drones.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#e2e8f0] rounded-xl">
              <div className="text-4xl mb-3">🚁</div>
              <p className="text-[#64748b]">No drones registered yet.</p>
            </div>
          ) : drones.map(d => {
            const m = STATUS_META[d.status] ?? STATUS_META.offline;
            const isActive = selected?.id === d.id;
            return (
              <div
                key={d.id}
                onClick={() => { setSelected(isActive ? null : d); setEditing(false); }}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all shadow-sm ${isActive ? "border-[#0f172a] ring-1 ring-[#0f172a]/20" : "border-[#e2e8f0] hover:border-[#0f172a]/30"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0f172a]/8 flex items-center justify-center text-xl">🚁</div>
                    <div>
                      <p className="font-bold text-[#0f172a]">{d.name}</p>
                      <p className="text-xs text-[#94a3b8]">{d.model || "Unknown model"} {d.serial_number ? `· ${d.serial_number}` : ""}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${m.color}`}>
                    {m.label}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-[#94a3b8] mb-1">Battery</p>
                    <BatteryBar pct={d.battery_pct} />
                  </div>
                  <div>
                    <p className="text-[#94a3b8] mb-1">Flight Hours</p>
                    <p className="font-semibold text-[#0f172a]">{d.total_flight_hours.toFixed(1)} h</p>
                  </div>
                  <div>
                    <p className="text-[#94a3b8] mb-1">Last Seen</p>
                    <p className="font-semibold text-[#0f172a]">
                      {d.last_seen ? new Date(d.last_seen).toLocaleString() : "Never"}
                    </p>
                  </div>
                </div>

                {d.current_mission_id && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    Active mission: {d.current_mission_id.slice(0, 8)}…
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail / control panel */}
        <div className="space-y-3">
          {selected ? (
            <>
              <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#0f172a] px-5 py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wide">Drone Details</p>
                    <p className="text-white font-bold text-lg mt-0.5">{selected.name}</p>
                  </div>
                  {!editing && (
                    <button
                      onClick={() => startEditing(selected)}
                      className="text-xs font-semibold text-white/80 hover:text-white border border-white/30 rounded-lg px-2.5 py-1"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <Row label="Model" value={selected.model || "—"} />
                  <Row label="Serial" value={selected.serial_number || "—"} mono />
                  <Row label="Flight Hours" value={`${selected.total_flight_hours.toFixed(1)} h`} />
                  <Row label="Registered" value={selected.registered_at ? new Date(selected.registered_at).toLocaleDateString() : "—"} />
                  {selected.home_lat != null && (
                    <Row label="Home Base" value={`${selected.home_lat.toFixed(4)}, ${selected.home_lng?.toFixed(4)}`} mono />
                  )}
                  {selected.current_lat != null && (
                    <Row label="Last Coords" value={`${selected.current_lat.toFixed(4)}, ${selected.current_lng?.toFixed(4)}`} mono />
                  )}
                  {selected.notes && <Row label="Notes" value={selected.notes} />}
                </div>
              </div>

              {/* Status control */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm space-y-3">
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wide">Change Status</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {ALL_STATUSES.map(s => {
                    const m = STATUS_META[s];
                    const active = selected.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selected.id, s)}
                        disabled={active}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${active ? `${m.color} cursor-default` : "border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                        {m.label}
                        {active && <span className="ml-auto">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Battery control */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm space-y-3">
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wide">Update Battery</p>
                <BatteryBar pct={selected.battery_pct} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={selected.battery_pct ?? 0}
                  onMouseUp={e => handleBatteryUpdate(selected.id, parseInt((e.target as HTMLInputElement).value))}
                  className="w-full accent-[#0f172a]"
                />
              </div>

              {/* MAVLink connection */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm space-y-3">
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wide">MAVLink Connection</p>
                <input
                  key={selected.id}
                  type="text"
                  defaultValue={selected.connection_string}
                  placeholder="udp:127.0.0.1:14550"
                  onBlur={e => {
                    if (e.target.value !== selected.connection_string) {
                      handleConnectionStringUpdate(selected.id, e.target.value);
                    }
                  }}
                  className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-xs font-mono text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30"
                />
                <p className="text-[10px] text-[#94a3b8]">
                  {selected.connection_string ? "Live telemetry polling every 10s." : "No connection set — status/battery must be updated manually."}
                </p>
              </div>
            </>
          ) : (
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 text-center shadow-sm">
              <div className="text-3xl mb-2">👈</div>
              <p className="text-sm text-[#94a3b8]">Select a drone to view details and controls</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit drone modal */}
      {editing && selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setEditing(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0f172a] px-5 py-4">
              <p className="text-white/60 text-xs uppercase tracking-wide">Edit Drone</p>
              <p className="text-white font-bold text-lg mt-0.5">{selected.name}</p>
            </div>
            <form onSubmit={handleEditSave} key={selected.id} className="p-5 space-y-3">
              {[
                { label: "Name", key: "name", placeholder: "Eagle-1" },
                { label: "Model", key: "model", placeholder: "DJI Matrice 300 RTK" },
                { label: "Serial Number", key: "serial_number", placeholder: "SN-123456" },
                { label: "Home Lat", key: "home_lat", placeholder: "27.529" },
                { label: "Home Lng", key: "home_lng", placeholder: "84.354" },
                { label: "Notes", key: "notes", placeholder: "optional" },
              ].map(f => (
                <div key={f.key} className="space-y-1">
                  <label className="text-xs font-medium text-[#64748b]">{f.label}</label>
                  <input
                    required={f.key === "name"}
                    value={(editForm as Record<string, string>)[f.key]}
                    onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="bg-[#0f172a] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1e293b]">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="border border-[#e2e8f0] text-[#64748b] text-sm px-4 py-2 rounded-lg hover:bg-[#f8fafc]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[#94a3b8]">{label}</span>
      <span className={`text-[#0f172a] text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
