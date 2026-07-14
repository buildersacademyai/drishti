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
    <section id="impact" className="py-28 bg-[#050d1a]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-[0.2em] mb-4">
            Objectives & Impact
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 max-w-3xl leading-tight">
            Numbers that{" "}
            <span className="gradient-text">matter.</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
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
                  ? "bg-[#f59e0b]/10 border-[#f59e0b]/30"
                  : "bg-white/[0.03] border-white/10"
              }`}
            >
              <div className={`text-3xl font-black mb-2 ${m.accent ? "text-[#f59e0b]" : "text-white"}`}>
                {m.value}
              </div>
              <div className="text-sm text-white/50 leading-relaxed">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Theory of change */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl bg-gradient-to-r from-[#1e3a5f]/40 to-[#f59e0b]/10 border border-white/10"
        >
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Theory of Change</div>
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
                    ? "text-white/30 text-xs"
                    : i === 6
                    ? "bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30"
                    : "bg-white/10 text-white/70 border border-white/10"
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
