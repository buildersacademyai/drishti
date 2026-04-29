"use client";
import { motion } from "framer-motion";

const tiers = [
  {
    num: "01",
    icon: "🛰️",
    label: "Satellite",
    title: "Wide-area screening",
    description:
      "Sentinel-2 imagery scans entire districts weekly at 10m resolution. NDWI water index + change detection flags new standing water automatically. Zero marginal cost. 100% district coverage.",
    metric: "70–80% fewer drone flights vs. blanket survey",
    color: "from-blue-600 to-indigo-600",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    tag: "text-blue-400",
  },
  {
    num: "02",
    icon: "🚁",
    title: "Drone verification",
    label: "Autonomous UAV",
    description:
      "Autonomous drones target only satellite-flagged zones, capturing sub-10cm imagery. YOLOv8 AI detects standing water and containers from survey altitude. Nano-shot descent confirms larvae.",
    metric: "48-hour verification · survey + nano-shot confirmation",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    tag: "text-amber-400",
  },
  {
    num: "03",
    icon: "💧",
    label: "Payload swap",
    title: "Precision intervention",
    description:
      "Confirmed habitats trigger a larvicide mission. Same drone airframe — camera swapped for spray tank in under 5 minutes. Precision application at exact confirmed coordinates only.",
    metric: "60–80% less chemical use vs. blanket spraying",
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    tag: "text-green-400",
  },
];

export function Solution() {
  return (
    <section id="solution" className="py-28 bg-[#f8f7f4]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#1e3a5f] uppercase tracking-[0.2em] mb-4">
            The Solution
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#1a1a2e] mb-6 max-w-3xl leading-tight">
            Three tiers.{" "}
            <span style={{ color: "#f59e0b" }}>One mission.</span>{" "}
            Faster response.
          </h2>
          <p className="text-lg text-[#6b7280] max-w-2xl leading-relaxed">
            Each stage costs less and moves faster than the one before. Satellite screens
            everything. Drone validates what matters. Intervention targets only what is
            confirmed — with a full georeferenced audit trail from pixel to spray.
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
              <h3 className="text-xl font-black text-[#1a1a2e] mb-3">{t.title}</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed mb-6">{t.description}</p>

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
          className="mt-10 p-6 rounded-2xl bg-[#1e3a5f] text-center"
        >
          <p className="text-white font-semibold text-lg">
            End-to-end cycle:{" "}
            <span className="text-[#f59e0b] font-black">4–5 days</span>
            {" "}vs.{" "}
            <span className="text-white/50">2–4 weeks manually</span>
            <span className="mx-4 text-white/20">·</span>
            Same drone, two payloads, three stages.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
