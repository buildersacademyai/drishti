"use client";
import { motion } from "framer-motion";

const stats = [
  {
    number: "10×",
    label: "Climate-driven risk",
    detail: "Disease, fire, and flood risk have multiplied across vulnerable regions in the past decade.",
    color: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/30",
    text: "text-red-400",
  },
  {
    number: "2–4 wk",
    label: "Detection lag",
    detail: "Paper-based and manual surveillance means emergencies are found weeks too late.",
    color: "from-amber-500/20 to-yellow-500/20",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  {
    number: "~30%",
    label: "Manual response accuracy",
    detail: "Ground teams reach only a fraction of at-risk zones with blanket, unguided response.",
    color: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
    text: "text-blue-400",
  },
];

export function Problem() {
  return (
    <section id="problem" className="py-28 bg-[#050d1a]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-[0.2em] mb-4">
            The Problem
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 max-w-3xl leading-tight">
            Climate change and{" "}
            <span className="gradient-text">emergencies</span> are outpacing manual response.
          </h2>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
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
              <div className="text-white font-bold text-lg mb-2">{s.label}</div>
              <div className="text-white/50 text-sm leading-relaxed">{s.detail}</div>
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
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-white/40 text-xs uppercase tracking-wider font-bold mb-3">Current approach</div>
            <ul className="space-y-3">
              {[
                "Paper-based surveillance, 2–4 week lag",
                "Field teams patrol at-risk zones — find ~30% of targets",
                "Blanket response regardless of confirmation",
                "No early warning — reactive, not predictive",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 rounded-2xl bg-[#f59e0b]/5 border border-[#f59e0b]/20">
            <div className="text-[#f59e0b] text-xs uppercase tracking-wider font-bold mb-3">With Drishti</div>
            <ul className="space-y-3">
              {[
                "Satellite screens 100% of district area weekly, free",
                "Drone validates only flagged zones — 70–80% fewer flights",
                "Precision response at confirmed sites only",
                "4–6 week risk prediction from fused data",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="text-[#f59e0b] mt-0.5 flex-shrink-0">✓</span>
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
