"use client";
import { useState } from "react";
import type { WaterPinProperties } from "./MapView";

interface Props {
  pin: WaterPinProperties;
  onClose: () => void;
  onSaveNotes: (notes: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onSendToMission: () => Promise<void>;
}

export function PinDetailPanel({ pin, onClose, onSaveNotes, onDelete, onSendToMission }: Props) {
  const [notes, setNotes] = useState(pin.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isManual = pin.detection_type === "manual_pin";

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSaveNotes(notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this water source?")) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSendToMission() {
    setSending(true);
    setError(null);
    try {
      await onSendToMission();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create mission");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="absolute top-4 left-4 z-20 w-80 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-[#0f172a] text-white">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5">Water Source</div>
          <div className="font-bold text-lg">{isManual ? "Manually pinned" : "Auto-detected"}</div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="p-5 space-y-4">
        {!isManual && pin.area_sqm != null && (
          <div className="text-sm text-[#64748b]">
            Area: <span className="font-semibold text-[#0f172a]">{pin.area_sqm.toFixed(0)} sqm</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#94a3b8]">Note</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Add a note…"
            className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#0f172a]/30"
          />
          <button
            onClick={handleSave}
            disabled={saving || notes === (pin.notes ?? "")}
            className="text-xs font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-40 rounded-lg px-3 py-1.5 transition-colors"
          >
            {saving ? "Saving…" : "Save note"}
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-600 px-2.5 py-2 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="pt-3 border-t border-[#f1f5f9] space-y-2">
          {pin.mission_status ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94a3b8]">Mission:</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#0f172a] capitalize">
                {pin.mission_status.replace("_", " ")}
              </span>
            </div>
          ) : (
            <button
              onClick={handleSendToMission}
              disabled={sending}
              className="w-full text-xs font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 rounded-lg py-2 transition-colors"
            >
              {sending ? "Creating mission…" : "Send to Mission"}
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={deleting || !!pin.mission_status}
            title={pin.mission_status ? "Has a mission attached — deal with that first" : undefined}
            className="w-full text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed py-1.5 transition-colors"
          >
            {deleting ? "Deleting…" : "Delete water source"}
          </button>
        </div>
      </div>
    </div>
  );
}
