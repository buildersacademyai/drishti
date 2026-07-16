"use client";
import { motion } from "framer-motion";

const tiers = [
  {
    num: "01",
    icon: "🛰️",
    label: "Satellite",
    title: "Wide-area screening",
    description:
      "Sentinel-2 imagery scans entire districts weekly at 10m resolution. NDWI water index + change detection flags target signatures automatically. Zero marginal cost. 100% district coverage.",
    metric: "70–80% fewer drone flights vs. blanket survey",
    color: "from-[#38bdf8] to-[#0ea5e9]",
    bg: "bg-[#38bdf8]/10",
    border: "border-[#38bdf8]/25",
    tag: "text-[#0284c7]",
  },
  {
    num: "02",
    icon: "🚁",
    title: "Drone verification",
    label: "Autonomous UAV",
    description:
      "Autonomous drones target only satellite-flagged zones, capturing sub-10cm imagery. AI detects the target signature for the active mission — standing water, thermal anomaly, wildlife presence, flood extent, or drop zone. Close-range descent confirms when needed.",
    metric: "48-hour verification · survey + nano-shot confirmation",
    color: "from-[#64748b] to-[#475569]",
    bg: "bg-[#64748b]/10",
    border: "border-[#64748b]/20",
    tag: "text-[#475569]",
  },
  {
    num: "03",
    icon: "💧",
    label: "Payload swap",
    title: "Precision intervention",
    description:
      "Confirmed targets trigger a response mission. Same drone airframe — payload swapped for the mission (larvicide tank, retardant canister, tracking tag, supply pod) in under 5 minutes. Precision delivery at exact confirmed coordinates only.",
    metric: "60–80% less response material vs. blanket application",
    color: "from-[#10b981] to-[#059669]",
    bg: "bg-[#10b981]/10",
    border: "border-[#10b981]/20",
    tag: "text-[#059669]",
  },
];

export function Solution() {
  return (
    <section id="solution" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#0f172a] uppercase tracking-[0.2em] mb-4">
            The Solution
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#0f172a] mb-6 max-w-3xl leading-tight">
            Three tiers.{" "}
            <span style={{ color: "#38bdf8" }}>One mission.</span>{" "}
            Faster response.
          </h2>
          <p className="text-lg text-[#64748b] max-w-2xl leading-relaxed">
            Each stage costs less and moves faster than the one before. Satellite screens
            everything. Drone validates what matters. Intervention targets only what is
            confirmed — with a full georeferenced audit trail from pixel to response.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {tiers.map((t, i) => (
            <motion.div
              key={t.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`relative p-8 rounded-2xl ${t.bg} border ${t.border} group hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-5xl">{t.icon}</span>
                <span className={`text-xs font-black ${t.tag} opacity-40 text-4xl`}>{t.num}</span>
              </div>

              <div className={`text-xs font-bold ${t.tag} uppercase tracking-wider mb-2`}>
                {t.label}
              </div>
              <h3 className="text-xl font-black text-[#0f172a] mb-3">{t.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed mb-6">{t.description}</p>

              <div className={`pt-4 border-t ${t.border}`}>
                <div className={`text-xs font-semibold ${t.tag}`}>{t.metric}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connecting stat */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 p-6 rounded-2xl bg-[#0f172a] text-center"
        >
          <p className="text-white font-semibold text-lg">
            End-to-end cycle:{" "}
            <span className="text-[#38bdf8] font-black">Instant</span>
            {" "}vs.{" "}
            <span className="text-white/50">2–4 weeks manually</span>
            <span className="mx-4 text-white/20">·</span>
            Same drone, swappable payload, three stages — across five missions.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
