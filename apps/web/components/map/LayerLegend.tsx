"use client";

const items = [
  { color: "#ef4444", label: "High risk district (≥75%)" },
  { color: "#f59e0b", label: "Medium risk district (50–74%)" },
  { color: "#84cc16", label: "Low risk district (25–49%)" },
  { color: "#e8f5e9", label: "Negligible risk" },
  { color: "#3b82f6", label: "Satellite water patch" },
  { color: "#f97316", label: "Drone detection" },
  { color: "#22c55e", label: "Intervention site" },
];

export function LayerLegend() {
  return (
    <div className="absolute bottom-8 right-4 z-10 bg-white/95 backdrop-blur rounded-xl border border-[#e2e8f0] shadow-md p-4 text-sm min-w-[200px]">
      <div className="font-semibold text-[#0f172a] mb-3 text-xs uppercase tracking-wide">Legend</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0 border border-black/10"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[#64748b] text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
