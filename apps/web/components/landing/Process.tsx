"use client";
import { motion } from "framer-motion";

const phases = [
  { icon: "🛰️", label: "Detect", desc: "Satellite screens 100% of the district, weekly, free." },
  { icon: "🚁", label: "Verify", desc: "Drone confirms only the flagged zones, sub-10cm imagery." },
  { icon: "🎯", label: "Respond", desc: "Same airframe, payload swapped, precision intervention." },
  { icon: "📊", label: "Predict", desc: "Fused data forecasts risk 4–6 weeks ahead." },
];

export function Process() {
  return (
    <section id="process" className="py-28 bg-white dark:bg-[#0b1220]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#0284c7] uppercase tracking-[0.2em] mb-4">
            How It Works
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#0f172a] dark:text-white mb-6 max-w-3xl leading-tight">
            Detect → Verify → Respond → Predict.{" "}
            <span className="gradient-text">One shared pipeline, five missions.</span>
          </h2>
          <p className="text-lg text-[#64748b] dark:text-[#94a3b8] max-w-2xl leading-relaxed">
            The same satellite-to-drone architecture powers every scope. Open any mission
            for its full step-by-step pipeline.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {phases.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-[#f8fafc] dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-white/10"
            >
              <span className="text-3xl">{p.icon}</span>
              <h3 className="text-sm font-bold text-[#0f172a] dark:text-white mt-3 mb-1">{p.label}</h3>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <a
          href="#scopes"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10b981] text-white font-bold hover:bg-[#059669] transition-colors text-sm"
        >
          Explore all five missions →
        </a>
      </div>
    </section>
  );
}
