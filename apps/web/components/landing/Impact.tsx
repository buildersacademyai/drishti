"use client";
import { motion } from "framer-motion";

const metrics = [
  { value: "~300,000", label: "Children under 15 — Year 1 protection target", accent: true },
  { value: "2 districts", label: "Nepal pilot geography (Chitwan + 1 mid-hill)", accent: false },
  { value: "Instant", label: "End-to-end cycle vs. 2–4 weeks manually", accent: false },
  { value: "70–80%", label: "Reduction in drone flight hours vs. blanket survey", accent: false },
  { value: "60–80%", label: "Less larvicide use vs. blanket spraying", accent: false },
  { value: "4–6 weeks", label: "Outbreak prediction horizon", accent: true },
];

export function Impact() {
  return (
    <section id="impact" className="py-28 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#0284c7] uppercase tracking-[0.2em] mb-4">
            Objectives & Impact
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#0f172a] mb-6 max-w-3xl leading-tight">
            Numbers that{" "}
            <span className="gradient-text">matter.</span>
          </h2>
          <p className="text-lg text-[#64748b] max-w-2xl leading-relaxed">
            Drishti is designed for measurable outcomes across every mission. These figures
            reflect our Disease Control pilot — the first scope in active development.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`p-6 rounded-2xl border ${
                m.accent
                  ? "bg-[#38bdf8]/10 border-[#38bdf8]/30"
                  : "bg-white border-[#e2e8f0]"
              }`}
            >
              <div className={`text-3xl font-black mb-2 ${m.accent ? "text-[#0284c7]" : "text-[#0f172a]"}`}>
                {m.value}
              </div>
              <div className="text-sm text-[#64748b] leading-relaxed">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Theory of change */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl bg-gradient-to-r from-[#0f172a]/5 to-[#38bdf8]/10 border border-[#e2e8f0]"
        >
          <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-4">Theory of Change</div>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            {[
              "Satellite data (free)",
              "→ Candidate zones ranked",
              "→ Drone validates",
              "→ Target confirmed",
              "→ Precision response",
              "→ Reduced impact",
              "→ Lives and resources protected",
            ].map((step, i) => (
              <span
                key={step}
                className={`px-3 py-1.5 rounded-lg font-medium ${
                  step.startsWith("→")
                    ? "text-[#94a3b8] text-xs"
                    : i === 6
                    ? "bg-[#10b981]/15 text-[#059669] border border-[#10b981]/30"
                    : "bg-white text-[#334155] border border-[#e2e8f0]"
                }`}
              >
                {step}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
