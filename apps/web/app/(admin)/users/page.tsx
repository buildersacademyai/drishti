"use client";
import { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/lib/client-api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string | null;
}

const ROLES = [
  { value: "admin",    label: "Admin" },
  { value: "fchv",     label: "FCHV Worker" },
  { value: "operator", label: "Operator" },
];

const ROLE_COLORS: Record<string, string> = {
  admin:    "bg-purple-100 text-purple-700",
  fchv:     "bg-blue-100 text-blue-700",
  operator: "bg-green-100 text-green-700",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "fchv" });
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setUsers(await apiGet<User[]>("/api/v1/users")); }
    catch { setUsers([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiPost("/api/v1/users", form);
      setShowForm(false);
      setForm({ email: "", password: "", name: "", role: "fchv" });
      setMsg({ text: "User created.", ok: true });
      load();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Failed", ok: false });
    }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Delete user ${email}?`)) return;
    setDeleting(id);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("drishti_token")}` },
      });
      setMsg({ text: "User deleted.", ok: true });
      load();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Failed", ok: false });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#1e3a5f] font-bold text-2xl">Users</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">Manage admin and field worker accounts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#1e3a5f] hover:bg-[#152d4d] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add User
        </button>
      </div>

      {msg && (
        <p className={`mb-4 text-sm rounded-lg px-4 py-2 border ${msg.ok ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
          {msg.text}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 bg-white border border-[#e5e7eb] rounded-xl p-5 space-y-4 shadow-sm"
        >
          <h2 className="font-semibold text-[#1e3a5f]">New User</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6b7280]">Full Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Dipak Sharma"
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6b7280]">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@example.com"
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6b7280]">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6b7280]">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="min 8 characters"
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#1e3a5f] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#152d4d] transition-colors">
              Create
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-[#e5e7eb] text-[#6b7280] text-sm px-4 py-2 rounded-lg hover:bg-[#f8f7f4] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f8f7f4]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Created</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6b7280]">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6b7280]">No users yet.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-[#f3f4f6] hover:bg-[#f8f7f4]/50 transition-colors">
                <td className="px-4 py-3 font-medium text-[#1e3a5f]">{u.name || "—"}</td>
                <td className="px-4 py-3 text-[#6b7280] text-sm">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6b7280] text-xs">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(u.id, u.email)}
                    disabled={deleting === u.id}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                  >
                    {deleting === u.id ? "Deleting…" : "Delete"}
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
