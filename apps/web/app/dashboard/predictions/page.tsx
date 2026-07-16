"use client";
import { useState, useEffect } from "react";
import { getPredictions, type Prediction } from "@/lib/client-api";

function riskColor(score: number) {
  if (score >= 0.75) return { bar: "bg-red-500", text: "text-red-700", label: "High" };
  if (score >= 0.5)  return { bar: "bg-amber-500", text: "text-amber-700", label: "Medium" };
  return { bar: "bg-green-500", text: "text-green-700", label: "Low" };
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setPredictions(await getPredictions()); }
      catch { setPredictions([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const sorted = [...predictions].sort((a, b) => b.risk_score - a.risk_score);
  const highRisk = predictions.filter((p) => p.risk_score >= 0.75).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[#0f172a] font-bold text-2xl">Risk Predictions</h1>
        <p className="text-[#64748b] text-sm mt-0.5">
          ML-based malaria vector risk scores by administrative unit
          {highRisk > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              {highRisk} high-risk zone{highRisk !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <p className="text-center text-[#64748b] py-12">Loading…</p>
      ) : predictions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-[#64748b]">No predictions available yet</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Admin Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Risk Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide w-48">Risk Level</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Uncertainty</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Horizon</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Target Date</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const { bar, text, label } = riskColor(p.risk_score);
                return (
                  <tr key={p.id} className="border-b border-[#f3f4f6] hover:bg-[#f8fafc]/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{p.admin_unit_id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${text}`}>
                        {(p.risk_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${bar}`}
                            style={{ width: `${p.risk_score * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold w-12 ${text}`}>{label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#64748b] text-sm">±{(p.uncertainty * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-[#64748b] text-sm">{p.target_horizon}d</td>
                    <td className="px-4 py-3 text-[#64748b] text-xs">
                      {p.target_date ? new Date(p.target_date).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
