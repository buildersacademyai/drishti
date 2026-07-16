"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAcquisitionDetail, type AcquisitionDetail } from "@/lib/client-api";

export default function ScanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [scan, setScan] = useState<AcquisitionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try { setScan(await getAcquisitionDetail(id)); }
      catch { setError(true); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) {
    return <p className="text-center text-[#64748b] py-12">Loading…</p>;
  }

  if (error || !scan) {
    return (
      <div className="p-6">
        <button onClick={() => router.push("/dashboard/scans")} className="text-sm text-[#0284c7] hover:underline mb-4">
          ← Back to Scans
        </button>
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🛰</div>
          <p className="text-[#64748b]">Scan not found</p>
        </div>
      </div>
    );
  }

  const newSites = scan.detections.filter((d) => d.is_new_site);

  return (
    <div className="p-6">
      <button onClick={() => router.push("/dashboard/scans")} className="text-sm text-[#0284c7] hover:underline mb-4">
        ← Back to Scans
      </button>

      <div className="mb-6">
        <h1 className="text-[#0f172a] font-bold text-2xl">{scan.admin_unit_name ?? "Unknown district"}</h1>
        <p className="text-[#64748b] text-sm mt-0.5">
          {scan.source} · {scan.acquired_at ? new Date(scan.acquired_at).toLocaleString() : "—"} · {scan.cloud_cover_pct.toFixed(1)}% cloud cover
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 text-center shadow-sm">
          <p className="text-3xl font-black text-[#0f172a]">{scan.detections.length}</p>
          <p className="text-xs text-[#94a3b8] uppercase tracking-wide mt-1">Water Sites Detected</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 text-center shadow-sm">
          <p className={`text-3xl font-black ${newSites.length > 0 ? "text-[#059669]" : "text-[#0f172a]"}`}>{newSites.length}</p>
          <p className="text-xs text-[#94a3b8] uppercase tracking-wide mt-1">New Sites (Alerted)</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 text-center shadow-sm">
          <p className="text-3xl font-black text-[#0f172a]">
            {(scan.detections.reduce((sum, d) => sum + (d.area_sqm ?? 0), 0) / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-[#94a3b8] uppercase tracking-wide mt-1">Total Water Area (sqm)</p>
        </div>
      </div>

      {scan.detections.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#e2e8f0] rounded-xl">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-[#64748b]">No water bodies detected — clean scan.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Area (sqm)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Promoted</th>
              </tr>
            </thead>
            <tbody>
              {scan.detections.map((d) => (
                <tr key={d.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{d.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-[#64748b] text-sm capitalize">{d.detection_type.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-[#0f172a] text-sm font-semibold">{(d.area_sqm ?? 0).toFixed(1)}</td>
                  <td className="px-4 py-3">
                    {d.is_new_site ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#10b981]/15 text-[#059669]">
                        New — alerted
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#94a3b8]">
                        Previously seen
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#64748b] text-sm capitalize">{d.promoted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
