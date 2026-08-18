"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const scopes = [
  {
    slug: "disease-control",
    icon: "🔬",
    title: "Disease Control",
    description:
      "Satellite screens for standing water, drones confirm breeding sites, precision spray response.",
    status: "active",
  },
  {
    slug: "fire-control",
    icon: "🔥",
    title: "Fire Control",
    description:
      "Satellite thermal anomalies flag ignition risk, drones verify spread, retardant response.",
    status: "vision",
  },
  {
    slug: "animal-surveillance",
    icon: "🐾",
    title: "Animal Surveillance",
    description:
      "Satellite habitat change detection, drones track and count wildlife, anti-poaching response.",
    status: "vision",
  },
  {
    slug: "flood-monitoring",
    icon: "🌊",
    title: "Flood Monitoring",
    description:
      "Satellite water-level trends flag rising risk, drones verify inundation, evacuation alerts.",
    status: "vision",
  },
  {
    slug: "emergency-delivery",
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
    <section id="scopes" className="py-28 bg-[#f8fafc] dark:bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-[0.2em] mb-4">
            Scopes
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#0f172a] dark:text-white mb-6 max-w-3xl leading-tight">
            One platform.{" "}
            <span style={{ color: "#38bdf8" }}>Five missions.</span>
          </h2>
          <p className="text-lg text-[#64748b] dark:text-[#94a3b8] max-w-2xl leading-relaxed">
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
              >
                <Link
                  href={`/missions/${s.slug}`}
                  className="group block h-full p-8 rounded-2xl bg-white dark:bg-[#0b1220] border border-[#e2e8f0] dark:border-white/10 hover:shadow-lg hover:border-[#38bdf8]/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{s.icon}</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#0f172a] dark:text-white mb-2">{s.title}</h3>
                  <p className="text-[#64748b] dark:text-[#94a3b8] text-sm leading-relaxed mb-4">{s.description}</p>
                  <span className="text-xs font-bold text-[#0284c7] group-hover:underline">
                    View details →
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
