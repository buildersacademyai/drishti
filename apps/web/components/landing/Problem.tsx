"use client";
import { motion } from "framer-motion";

const stats = [
  {
    number: "10×",
    label: "Climate-driven risk",
    detail: "Disease, fire, and flood risk have multiplied across vulnerable regions in the past decade.",
    color: "from-[#0f172a]/10 to-[#1e293b]/5",
    border: "border-[#0f172a]/15",
    text: "text-[#0f172a]",
  },
  {
    number: "2–4 wk",
    label: "Detection lag",
    detail: "Paper-based and manual surveillance means emergencies are found weeks too late.",
    color: "from-[#64748b]/10 to-[#94a3b8]/5",
    border: "border-[#64748b]/20",
    text: "text-[#64748b]",
  },
  {
    number: "~30%",
    label: "Manual response accuracy",
    detail: "Ground teams reach only a fraction of at-risk zones with blanket, unguided response.",
    color: "from-[#38bdf8]/10 to-[#0ea5e9]/5",
    border: "border-[#38bdf8]/25",
    text: "text-[#0284c7]",
  },
];

export function Problem() {
  return (
    <section id="problem" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#0284c7] uppercase tracking-[0.2em] mb-4">
            The Problem
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#0f172a] mb-6 max-w-3xl leading-tight">
            Climate change and{" "}
            <span className="gradient-text">emergencies</span> are outpacing manual response.
          </h2>
          <p className="text-lg text-[#64748b] max-w-2xl leading-relaxed">
            Warming temperatures, shifting weather patterns, and growing climate volatility
            are creating new risks — disease outbreaks, wildfires, floods, wildlife loss —
            faster than manual, ground-based response can keep up.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-2xl bg-gradient-to-br ${s.color} border ${s.border}`}
            >
              <div className={`text-6xl font-black ${s.text} mb-3`}>{s.number}</div>
              <div className="text-[#0f172a] font-bold text-lg mb-2">{s.label}</div>
              <div className="text-[#64748b] text-sm leading-relaxed">{s.detail}</div>
            </motion.div>
          ))}
        </div>

        {/* Challenge statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="p-8 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[#94a3b8] text-xs uppercase tracking-wider font-bold mb-3">Current approach</div>
            <ul className="space-y-3">
              {[
                "Paper-based surveillance, 2–4 week lag",
                "Field teams patrol at-risk zones — find ~30% of targets",
                "Blanket response regardless of confirmation",
                "No early warning — reactive, not predictive",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#64748b]">
                  <span className="text-[#94a3b8] mt-0.5 flex-shrink-0">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 rounded-2xl bg-[#10b981]/5 border border-[#10b981]/20">
            <div className="text-[#059669] text-xs uppercase tracking-wider font-bold mb-3">With Drishti</div>
            <ul className="space-y-3">
              {[
                "Satellite screens 100% of district area weekly, free",
                "Drone validates only flagged zones — 70–80% fewer flights",
                "Precision response at confirmed sites only",
                "4–6 week risk prediction from fused data",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#334155]">
                  <span className="text-[#10b981] mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
