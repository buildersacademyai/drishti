"use client";
import { motion } from "framer-motion";

const stack = [
  { name: "FastAPI", category: "Backend" },
  { name: "PostGIS", category: "Database" },
  { name: "YOLOv8", category: "CV" },
  { name: "XGBoost", category: "Prediction" },
  { name: "Next.js", category: "Frontend" },
  { name: "MapLibre GL", category: "Maps" },
  { name: "Sentinel-2", category: "Satellite" },
  { name: "Apache 2.0", category: "License" },
];

export function Technology() {
  return (
    <section id="technology" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-[#1a1a2e] mb-4">Built open, built local.</h2>
          <p className="text-lg text-[#6b7280] mb-12 max-w-2xl">
            Every component is open-source. Data stays in-country. Drone hardware builds on the
            team&apos;s existing agricultural spray platform — no new airframes, no vendor lock-in.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stack.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-[#f8f7f4] border border-[#e5e7eb]"
            >
              <div className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                {item.category}
              </div>
              <div className="font-semibold text-[#1a1a2e]">{item.name}</div>
            </motion.div>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/20">
          <p className="text-[#1e3a5f] font-medium">
            Apache 2.0 licensed · All code on GitHub · Deployable in any country · No cloud
            vendor required
          </p>
        </div>
      </div>
    </section>
  );
}
