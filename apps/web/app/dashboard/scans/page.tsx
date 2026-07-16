"use client";
import { useState, useEffect } from "react";
import { getAcquisitions, type Acquisition } from "@/lib/client-api";

export default function ScansPage() {
  const [acquisitions, setAcquisitions] = useState<Acquisition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setAcquisitions(await getAcquisitions()); }
      catch { setAcquisitions([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const positiveCount = acquisitions.filter((a) => a.new_site_count > 0).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[#0f172a] font-bold text-2xl">Satellite Scans</h1>
        <p className="text-[#64748b] text-sm mt-0.5">
          Every satellite ingestion run, positive or negative
          {positiveCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#0284c7] text-xs font-semibold">
              {positiveCount} with new sites
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <p className="text-center text-[#64748b] py-12">Loading…</p>
      ) : acquisitions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🛰</div>
          <p className="text-[#64748b]">No scans run yet</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">District</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Cloud Cover</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Water Sites</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide w-40">Result</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Scanned</th>
              </tr>
            </thead>
            <tbody>
              {acquisitions.map((a) => (
                <tr key={a.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#0f172a]">{a.admin_unit_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[#64748b] text-sm capitalize">{a.source}</td>
                  <td className="px-4 py-3 text-[#64748b] text-sm">{a.cloud_cover_pct.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-[#0f172a] text-sm font-semibold">{a.detection_count}</td>
                  <td className="px-4 py-3">
                    {a.new_site_count > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#10b981]/15 text-[#059669]">
                        {a.new_site_count} new site{a.new_site_count !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#94a3b8]">
                        No new activity
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#64748b] text-xs">
                    {a.acquired_at ? new Date(a.acquired_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
