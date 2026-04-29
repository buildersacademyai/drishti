"use client";

const items = [
  { color: "#3b82f6", label: "Satellite water patch (NDWI)" },
  { color: "#ef4444", label: "Larvae confirmed" },
  { color: "#f59e0b", label: "Water body detected" },
  { color: "#a78bfa", label: "Intervention planned" },
  { color: "#22c55e", label: "Intervention completed" },
];

export function LayerLegend() {
  return (
    <div className="absolute bottom-8 right-4 z-10 bg-white/95 backdrop-blur rounded-xl border border-[#e5e7eb] shadow-md p-4 text-sm">
      <div className="font-semibold text-[#1a1a2e] mb-3">Layers</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[#6b7280]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
