"use client";
import { motion } from "framer-motion";

const milestones = [
  {
    quarter: "Q2 2026",
    status: "active",
    title: "UNICEF Venture Fund application",
    items: [
      "Open-source codebase on GitHub",
      "Satellite NDWI pipeline (Chitwan demo data)",
      "YOLOv8 survey + EfficientNet nano-shot models",
      "FastAPI backend with prediction engine",
      "Landing page + dashboard prototype",
    ],
  },
  {
    quarter: "Q3 2026",
    status: "planned",
    title: "Nepal pilot — 2 districts",
    items: [
      "Live Sentinel-2 acquisition (weekly)",
      "First drone survey flights in Chitwan",
      "Roboflow-annotated real dataset → model retrain",
      "MoHP dashboard onboarding",
      "First intervention cycle end-to-end",
    ],
  },
  {
    quarter: "Q4 2026",
    status: "planned",
    title: "Scale + evaluation",
    items: [
      "3 additional districts",
      "Peer-reviewed impact metrics",
      "Multi-country adaptation guide",
      "Offline-first PWA for field workers",
    ],
  },
];

const statusColor: Record<string, string> = {
  active: "bg-[#f59e0b]",
  planned: "bg-[#d1d5db]",
};

export function Roadmap() {
  return (
    <section id="roadmap" className="py-24 bg-[#f8f7f4]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-[#1a1a2e] mb-4">What comes next.</h2>
          <p className="text-lg text-[#6b7280] mb-12 max-w-2xl">
            From application to pilot to scale — a 12-month path to measurable impact in Nepal&apos;s
            mid-hill districts.
          </p>
        </motion.div>

        <div className="space-y-6">
          {milestones.map((m, i) => (
            <motion.div
              key={m.quarter}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-6 p-6 rounded-2xl bg-white border border-[#e5e7eb]"
            >
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${statusColor[m.status]}`} />
                {i < milestones.length - 1 && (
                  <div className="w-0.5 flex-1 bg-[#e5e7eb]" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                  {m.quarter}
                </div>
                <div className="font-bold text-[#1a1a2e] mb-3">{m.title}</div>
                <ul className="space-y-1">
                  {m.items.map((item) => (
                    <li key={item} className="text-sm text-[#6b7280] flex items-start gap-2">
                      <span className="text-[#f59e0b] mt-0.5">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
