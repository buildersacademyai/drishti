"use client";
import Link from "next/link";
import type { MissionServer, Detection, Intervention, AlertServer, DroneServer } from "@/lib/api";

interface Props {
  missions: MissionServer[];
  detections: Detection[];
  interventions: Intervention[];
  alerts: AlertServer[];
  drones: DroneServer[];
}

function StatCard({
  label,
  value,
  sub,
  href,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow block"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{label}</p>
      <p className={`text-4xl font-black mt-2 ${accent}`}>{value}</p>
      <p className="text-xs text-[#64748b] mt-1">{sub}</p>
    </Link>
  );
}

export function DashboardClient({ missions, detections, interventions, alerts, drones }: Props) {
  const activeMissions = missions.filter((m) => ["planned", "dispatched", "in_flight"].includes(m.status)).length;

  const droneStatusCounts = {
    at_station:  drones.filter(d => d.status === "at_station").length,
    in_field:    drones.filter(d => d.status === "in_field").length,
    charging:    drones.filter(d => d.status === "charging").length,
    maintenance: drones.filter(d => d.status === "maintenance").length,
    offline:     drones.filter(d => d.status === "offline").length,
  };
  const dronesInField = droneStatusCounts.in_field;
  const highConf = detections.filter((d) => d.confidence >= 0.8).length;
  const activeAlerts = alerts.filter((a) => !a.acknowledged_at).length;
  const criticalAlerts = alerts.filter((a) => !a.acknowledged_at && a.severity === "critical").length;

  const recentMissions = [...missions]
    .sort((a, b) => (b.planned_at ?? "").localeCompare(a.planned_at ?? ""))
    .slice(0, 5);

  const recentDetections = detections.slice(0, 5);

  const STATUS_COLORS: Record<string, string> = {
    planned:    "bg-blue-100 text-blue-700",
    dispatched: "bg-amber-100 text-amber-700",
    in_flight:  "bg-purple-100 text-purple-700",
    completed:  "bg-green-100 text-green-700",
    aborted:    "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#0f172a] font-bold text-2xl">Dashboard</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Drishti malaria vector surveillance platform overview</p>
      </div>

      {/* Critical alert banner */}
      {criticalAlerts > 0 && (
        <Link
          href="/dashboard/alerts"
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3 hover:bg-red-100 transition-colors"
        >
          <span className="text-lg">🚨</span>
          <p className="text-red-700 font-semibold text-sm">
            {criticalAlerts} critical alert{criticalAlerts !== 1 ? "s" : ""} require immediate attention →
          </p>
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Missions"
          value={missions.length}
          sub={`${activeMissions} active`}
          href="/dashboard/missions"
          accent="text-[#0f172a]"
        />
        <StatCard
          label="Detections"
          value={detections.length}
          sub={`${highConf} high confidence`}
          href="/dashboard/detections"
          accent="text-[#38bdf8]"
        />
        <StatCard
          label="Interventions"
          value={interventions.length}
          sub="total logged"
          href="/dashboard/interventions"
          accent="text-blue-600"
        />
        <StatCard
          label="Alerts"
          value={activeAlerts}
          sub={activeAlerts === 0 ? "all clear" : "need action"}
          href="/dashboard/alerts"
          accent={activeAlerts > 0 ? "text-red-600" : "text-green-600"}
        />
      </div>

      {/* Drone Fleet */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚁</span>
            <h2 className="font-semibold text-[#0f172a] text-sm">Drone Fleet</h2>
            <span className="text-xs bg-[#0f172a]/8 text-[#0f172a] font-semibold px-2 py-0.5 rounded-full">{drones.length} total</span>
          </div>
          <Link href="/dashboard/drones" className="text-xs text-[#10b981] hover:underline font-medium">Manage fleet →</Link>
        </div>
        {drones.length === 0 ? (
          <p className="px-5 py-6 text-center text-[#64748b] text-sm">No drones registered. <Link href="/dashboard/drones" className="text-[#10b981] hover:underline">Register one →</Link></p>
        ) : (
          <div className="p-4">
            {/* Status breakdown */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              {([
                ["at_station",  "At Station",  "bg-green-100 text-green-700",   "bg-green-500"],
                ["in_field",    "In Field",    "bg-blue-100 text-blue-700",     "bg-blue-500"],
                ["charging",    "Charging",    "bg-amber-100 text-amber-700",   "bg-amber-400"],
                ["maintenance", "Maintenance", "bg-orange-100 text-orange-700", "bg-orange-500"],
                ["offline",     "Offline",     "bg-gray-100 text-gray-500",     "bg-gray-400"],
              ] as [keyof typeof droneStatusCounts, string, string, string][]).map(([key, label, color, dot]) => (
                <div key={key} className={`rounded-xl px-3 py-2.5 text-center ${color}`}>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    <span className="font-black text-xl">{droneStatusCounts[key]}</span>
                  </div>
                  <p className="text-[10px] font-medium">{label}</p>
                </div>
              ))}
            </div>
            {/* Drone rows — top 4 */}
            <div className="divide-y divide-[#f3f4f6]">
              {drones.slice(0, 4).map(d => {
                const statusColors: Record<string, string> = {
                  at_station: "bg-green-100 text-green-700",
                  in_field: "bg-blue-100 text-blue-700",
                  charging: "bg-amber-100 text-amber-700",
                  maintenance: "bg-orange-100 text-orange-700",
                  offline: "bg-gray-100 text-gray-500",
                };
                return (
                  <div key={d.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#0f172a]/8 flex items-center justify-center text-sm">🚁</div>
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">{d.name}</p>
                        <p className="text-xs text-[#94a3b8]">{d.model || "Unknown model"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {d.battery_pct != null && (
                        <span className="text-xs font-medium" style={{ color: d.battery_pct >= 60 ? "#22c55e" : d.battery_pct >= 25 ? "#f59e0b" : "#ef4444" }}>
                          {d.battery_pct}%
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[d.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {d.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {drones.length > 4 && (
              <Link href="/dashboard/drones" className="block text-center text-xs text-[#10b981] hover:underline mt-3 font-medium">
                +{drones.length - 4} more drones →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Two-column activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent missions */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="font-semibold text-[#0f172a] text-sm">Recent Missions</h2>
            <Link href="/dashboard/missions" className="text-xs text-[#10b981] hover:underline font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-[#f1f5f9]">
            {recentMissions.length === 0 ? (
              <p className="px-5 py-6 text-center text-[#64748b] text-sm">No missions yet.</p>
            ) : recentMissions.map((m) => (
              <div key={m.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0f172a] capitalize">{m.mission_type}</p>
                  <p className="text-xs text-[#64748b] font-mono">{m.id.slice(0, 8)}…</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[m.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent detections */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="font-semibold text-[#0f172a] text-sm">Recent Detections</h2>
            <Link href="/dashboard/detections" className="text-xs text-[#10b981] hover:underline font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-[#f1f5f9]">
            {recentDetections.length === 0 ? (
              <p className="px-5 py-6 text-center text-[#64748b] text-sm">No detections yet.</p>
            ) : recentDetections.map((d) => (
              <div key={d.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0f172a] capitalize">{d.detection_type.replace("_", " ")}</p>
                  <p className="text-xs text-[#64748b]">
                    {d.lat != null && d.lng != null ? `${d.lat.toFixed(3)}, ${d.lng.toFixed(3)}` : "no coords"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#38bdf8]">{(d.confidence * 100).toFixed(0)}%</p>
                  <p className="text-xs text-[#64748b]">confidence</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/dashboard/map"
          className="bg-[#0f172a] text-white rounded-xl p-5 hover:bg-[#1e293b] transition-colors"
        >
          <div className="text-2xl mb-2">🗺</div>
          <p className="font-semibold text-sm">Live Map</p>
          <p className="text-white/50 text-xs mt-0.5">Real-time detection view</p>
        </Link>
        <Link
          href="/dashboard/predictions"
          className="bg-white border border-[#e2e8f0] rounded-xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">📊</div>
          <p className="font-semibold text-sm text-[#0f172a]">Risk Predictions</p>
          <p className="text-[#64748b] text-xs mt-0.5">ML-based zone risk scores</p>
        </Link>
        <Link
          href="/dashboard/interventions"
          className="bg-white border border-[#e2e8f0] rounded-xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">💧</div>
          <p className="font-semibold text-sm text-[#0f172a]">Interventions</p>
          <p className="text-[#64748b] text-xs mt-0.5">Larvicide operations log</p>
        </Link>
      </div>
    </div>
  );
}
