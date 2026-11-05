"use client";
import { useEffect } from "react";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  blocked,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  blocked?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !busy && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-[#0f172a] font-bold text-lg">{title}</h2>
        <p className="mt-1.5 text-sm text-[#64748b]">{message}</p>
        {blocked && (
          <div className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <span aria-hidden>⚠️</span>
            <span>{blocked}</span>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            autoFocus
            disabled={busy}
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] disabled:opacity-50"
          >
            {blocked ? "Close" : "Cancel"}
          </button>
          {!blocked && <button
            disabled={busy}
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>}
        </div>
      </div>
    </div>
  );
}
