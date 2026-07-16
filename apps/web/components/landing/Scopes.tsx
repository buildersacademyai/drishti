"use client";
import { motion } from "framer-motion";

const scopes = [
  {
    icon: "🔬",
    title: "Disease Control",
    description:
      "Satellite screens for standing water, drones confirm breeding sites, precision spray response.",
    status: "active",
  },
  {
    icon: "🔥",
    title: "Fire Control",
    description:
      "Satellite thermal anomalies flag ignition risk, drones verify spread, retardant response.",
    status: "vision",
  },
  {
    icon: "🐾",
    title: "Animal Surveillance",
    description:
      "Satellite habitat change detection, drones track and count wildlife, anti-poaching response.",
    status: "vision",
  },
  {
    icon: "🌊",
    title: "Flood Monitoring",
    description:
      "Satellite water-level trends flag rising risk, drones verify inundation, evacuation alerts.",
    status: "vision",
  },
  {
    icon: "📦",
    title: "Emergency Delivery",
    description:
      "Satellite routing around hazards, drones verify landing zones, autonomous supply drop.",
    status: "vision",
  },
];

const statusStyle: Record<string, { dot: string; label: string }> = {
  active: { dot: "bg-[#10b981] animate-pulse", label: "Active" },
  vision: { dot: "bg-[#94a3b8]", label: "Vision" },
};

export function Scopes() {
  return (
    <section id="scopes" className="py-28 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#0f172a] uppercase tracking-[0.2em] mb-4">
            Scopes
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#0f172a] mb-6 max-w-3xl leading-tight">
            One platform.{" "}
            <span style={{ color: "#38bdf8" }}>Five missions.</span>
          </h2>
          <p className="text-lg text-[#64748b] max-w-2xl leading-relaxed">
            Same satellite-to-drone architecture — screen, verify, respond —
            applied wherever climate and emergency response need eyes in the sky.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scopes.map((s, i) => {
            const st = statusStyle[s.status];
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-8 rounded-2xl bg-white border border-[#e2e8f0] hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{s.icon}</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[#64748b]">
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#0f172a] mb-2">{s.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{s.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
