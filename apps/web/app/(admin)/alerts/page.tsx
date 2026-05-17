"use client";
import { useState, useEffect } from "react";
import { getAlerts, acknowledgeAlert, type Alert } from "@/lib/client-api";

const SEV_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border border-red-200",
  high:     "bg-orange-100 text-orange-700 border border-orange-200",
  medium:   "bg-amber-100 text-amber-700 border border-amber-200",
  low:      "bg-blue-100 text-blue-700 border border-blue-200",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAcked, setShowAcked] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  async function load() {
    setLoading(true);
    try { setAlerts(await getAlerts()); }
    catch { setAlerts([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleAck(id: string) {
    try {
      await acknowledgeAlert(id);
      setActionMsg("Alert acknowledged.");
      load();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  const visible = showAcked ? alerts : alerts.filter((a) => !a.acknowledged_at);
  const activeCount = alerts.filter((a) => !a.acknowledged_at).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#1e3a5f] font-bold text-2xl">Alerts</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">
            {activeCount > 0
              ? `${activeCount} active alert${activeCount !== 1 ? "s" : ""} requiring attention`
              : "All alerts acknowledged"}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#6b7280] cursor-pointer">
          <input
            type="checkbox"
            checked={showAcked}
            onChange={(e) => setShowAcked(e.target.checked)}
            className="rounded"
          />
          Show acknowledged
        </label>
      </div>

      {actionMsg && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          {actionMsg}
        </p>
      )}

      {loading ? (
        <p className="text-center text-[#6b7280] py-12">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-[#6b7280]">No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((a) => (
            <div
              key={a.id}
              className={`bg-white border rounded-xl p-5 shadow-sm flex items-start justify-between gap-4 transition-opacity ${a.acknowledged_at ? "opacity-50" : ""}`}
            >
              <div className="flex items-start gap-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${SEV_COLORS[a.severity] ?? "bg-gray-100 text-gray-600"}`}>
                  {a.severity}
                </span>
                <div>
                  <p className="text-[#1e3a5f] font-semibold text-sm capitalize">{a.channel} alert</p>
                  <p className="text-[#6b7280] text-xs mt-0.5">
                    Role: {a.recipient_role ?? "all"} ·
                    {a.created_at ? ` ${new Date(a.created_at).toLocaleString()}` : ""}
                  </p>
                  {a.acknowledged_at && (
                    <p className="text-green-600 text-xs mt-1">
                      Acknowledged {new Date(a.acknowledged_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              {!a.acknowledged_at && (
                <button
                  onClick={() => handleAck(a.id)}
                  className="flex-shrink-0 text-xs font-semibold bg-[#1e3a5f] text-white px-3 py-1.5 rounded-lg hover:bg-[#152d4d] transition-colors"
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
