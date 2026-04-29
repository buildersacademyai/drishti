"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const tiers = [
  {
    id: "satellite",
    icon: "🛰️",
    title: "Wide-area screening",
    subtitle: "Satellite",
    description:
      "Sentinel-2 satellite imagery scans entire districts weekly, identifying standing water and potential breeding sites at 10m resolution. Zero marginal cost. 100% coverage.",
    stat: "70–80% reduction in drone flight hours vs. blanket surveys",
  },
  {
    id: "drone",
    icon: "🚁",
    title: "High-resolution verification",
    subtitle: "Drone",
    description:
      "Autonomous drones target satellite-flagged zones, capturing sub-10cm imagery. AI detects larvae, confirms habitat type, and filters false positives with nano-shot close-ups.",
    stat: "48-hour verification cycle · survey + nano-shot confirmation",
  },
  {
    id: "spray",
    icon: "💧",
    title: "Targeted intervention",
    subtitle: "Same drone, payload swap",
    description:
      "Confirmed habitats trigger precision larvicide application. Same drone airframe, swapped payload. Only treat what is confirmed — 60–80% less chemical use than blanket spraying.",
    stat: "72-hour flag-to-treatment cycle vs. 2–4 weeks manually",
  },
];

export function Solution() {
  const [active, setActive] = useState("satellite");
  const current = tiers.find((t) => t.id === active)!;

  return (
    <section id="solution" className="py-24 bg-[#f8f7f4]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-[#1a1a2e] mb-4">
            Three tiers. One mission. Faster response.
          </h2>
          <p className="text-lg text-[#6b7280] mb-12 max-w-2xl">
            Satellite screens everything. Drone validates what matters. Intervention targets only
            what is confirmed. Each stage costs less and moves faster than manual alternatives.
          </p>
        </motion.div>

        <div className="flex gap-2 mb-8">
          {tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                active === t.id
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border-[#1e3a5f]"
              }`}
            >
              {t.icon} {t.subtitle}
            </button>
          ))}
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-10 border border-[#e5e7eb]"
        >
          <div className="text-4xl mb-4">{current.icon}</div>
          <h3 className="text-2xl font-bold text-[#1a1a2e] mb-3">{current.title}</h3>
          <p className="text-[#6b7280] text-lg leading-relaxed mb-6">{current.description}</p>
          <div className="inline-block px-4 py-2 rounded-lg bg-[#f59e0b]/10 text-[#b45309] text-sm font-medium">
            {current.stat}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
