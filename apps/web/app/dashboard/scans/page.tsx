"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getAcquisitions, deleteAcquisition, type Acquisition } from "@/lib/client-api";

export default function ScansPage() {
  const router = useRouter();
  const [acquisitions, setAcquisitions] = useState<Acquisition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setAcquisitions(await getAcquisitions()); }
      catch { setAcquisitions([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem("drishti_token");
      if (t) setIsAdmin(JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role === "admin");
    } catch {}
  }, []);

  const [pending, setPending] = useState<Acquisition | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    try {
      await deleteAcquisition(pending.id);
      setAcquisitions((xs) => xs.filter((x) => x.id !== pending.id));
      setError(null);
      setPending(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.startsWith("409")) {
        setBlocked("This scan can't be deleted because one or more of its detections have a mission attached. Delete or complete those missions first, then try again.");
      } else {
        setPending(null);
        setError("Couldn't delete the scan. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  }

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

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
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
                {isAdmin && <th className="w-12" />}
              </tr>
            </thead>
            <tbody>
              {acquisitions.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => router.push(`/dashboard/scans/${a.id}`)}
                  className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-[#0f172a]">{a.admin_unit_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[#64748b] text-sm capitalize">{a.source}</td>
                  <td className="px-4 py-3 text-[#64748b] text-sm">{a.cloud_cover_pct.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-[#0f172a] text-sm font-semibold">{a.detection_count}</td>
                  <td className="px-4 py-3">
                    {a.new_site_count > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#10b981]/15 text-[#059669] hover:underline">
                        {a.new_site_count} new site{a.new_site_count !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#94a3b8] hover:underline">
                        No new activity
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#64748b] text-xs">
                    {a.acquired_at ? new Date(a.acquired_at).toLocaleString() : "—"}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPending(a); }}
                        title="Delete scan"
                        aria-label="Delete scan"
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
      )}
      {pending && (
        <ConfirmDialog
          title="Delete scan?"
          message={`This permanently deletes the scan of ${pending.admin_unit_name ?? "this district"} and its ${pending.detection_count} detection(s).`}
          busy={deleting}
          onConfirm={confirmDelete}
          blocked={blocked}
          onCancel={() => { setPending(null); setBlocked(null); }}
        />
      )}
    </div>
  );
}
