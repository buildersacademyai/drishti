"use client";
import { motion } from "framer-motion";

const milestones = [
  {
    quarter: "Q2 2026",
    phase: "Foundation",
    status: "active",
    items: [
      "Open-source codebase — Apache 2.0, all code on GitHub",
      "Satellite NDWI pipeline — Chitwan demo data",
      "YOLOv8 survey + EfficientNet nano-shot models trained",
      "FastAPI backend with XGBoost prediction engine",
      "MapLibre dashboard + landing page",
    ],
  },
  {
    quarter: "Q3 2026",
    phase: "Nepal Pilot",
    status: "planned",
    items: [
      "Live Sentinel-2 acquisition (weekly automated)",
      "First drone survey flights in Chitwan district",
      "Real annotated dataset → model retrain",
      "Nepal MoHP / EDCD dashboard onboarding",
      "First complete verify→validate→execute cycle",
    ],
  },
  {
    quarter: "Q4 2026",
    phase: "Scale",
    status: "planned",
    items: [
      "3 additional Nepal districts",
      "Malaria + Japanese Encephalitis models",
      "Offline-first PWA for field workers",
      "Peer-reviewed impact metrics published",
    ],
  },
  {
    quarter: "2027+",
    phase: "Expansion",
    status: "future",
    items: [
      "India and Bangladesh pilots",
      "Multi-country adaptation guide",
      "Aquaculture monitoring vertical",
      "Open-source community in 5+ countries",
    ],
  },
];

const statusStyle: Record<string, { dot: string; border: string; bg: string; label: string }> = {
  active: { dot: "bg-[#f59e0b] animate-pulse", border: "border-[#f59e0b]/30", bg: "bg-[#f59e0b]/5", label: "Active" },
  planned: { dot: "bg-[#3b82f6]", border: "border-blue-500/20", bg: "bg-blue-500/5", label: "Planned" },
  future: { dot: "bg-[#6b7280]", border: "border-white/10", bg: "bg-white/[0.02]", label: "Future" },
};

export function Roadmap() {
  return (
    <section id="roadmap" className="py-28 bg-[#050d1a]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-[0.2em] mb-4">
            Roadmap
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 max-w-3xl leading-tight">
            Foundation → Pilot →{" "}
            <span className="gradient-text">Scale.</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
            A disciplined 12-month path to measurable impact in Nepal, designed to
            expand to any country with vector-borne disease burden.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((m, i) => {
            const s = statusStyle[m.status];
            return (
              <motion.div
                key={m.quarter}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border ${s.border} ${s.bg}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                  <span className="text-xs text-white/30 font-medium">{s.label}</span>
                </div>
                <div className="text-xs text-[#f59e0b] font-bold uppercase tracking-wider mb-1">
                  {m.quarter}
                </div>
                <div className="text-white font-black text-lg mb-4">{m.phase}</div>
                <ul className="space-y-2">
                  {m.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-white/40 leading-relaxed">
                      <span className="mt-0.5 flex-shrink-0 text-white/20">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
