"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Mission } from "@/lib/missions";

const statusStyle: Record<string, { dot: string; label: string }> = {
  active: { dot: "bg-[#10b981] animate-pulse", label: "Active" },
  vision: { dot: "bg-[#94a3b8]", label: "Vision — not yet built" },
};

export function MissionDetail({ mission }: { mission: Mission }) {
  const st = statusStyle[mission.status];

  return (
    <div className="bg-white dark:bg-[#0b1220]">
      {/* Hero */}
      <section className="py-16 border-b border-[#e2e8f0] dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6">
          <Link
            href="/#scopes"
            className="inline-flex items-center gap-1 text-sm text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white transition-colors mb-8"
          >
            ← Back to all missions
          </Link>

          <div className="flex items-start justify-between gap-6 mb-6">
            <span className="text-6xl">{mission.icon}</span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#64748b] dark:text-[#94a3b8] mt-2">
              <span className={`w-2 h-2 rounded-full ${st.dot}`} />
              {st.label}
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-[#0f172a] dark:text-white mb-4 leading-tight">
            {mission.title}
          </h1>
          <p className="text-lg text-[#64748b] dark:text-[#94a3b8] max-w-2xl leading-relaxed">
            {mission.tagline}
          </p>
        </div>
      </section>

      {/* Summary */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-lg text-[#334155] dark:text-[#cbd5e1] leading-relaxed max-w-3xl">
            {mission.summary}
          </p>
        </div>
      </section>

      {/* Metrics, if any */}
      {mission.metrics && mission.metrics.length > 0 && (
        <section className="pb-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mission.metrics.map((m) => (
                <div
                  key={m.label}
                  className="p-6 rounded-2xl border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-[#0b1220]"
                >
                  <div className="text-3xl font-black text-[#0f172a] dark:text-white mb-2">{m.value}</div>
                  <div className="text-sm text-[#64748b] dark:text-[#94a3b8] leading-relaxed">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pipeline */}
      <section className="py-16 bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-xs font-bold text-[#0284c7] uppercase tracking-[0.2em] mb-8">
            How it works
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {mission.pipeline.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="relative p-6 rounded-2xl bg-white dark:bg-[#0b1220] border border-[#e2e8f0] dark:border-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-xs font-black text-[#cbd5e1]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0f172a] dark:text-white mb-2">{s.title}</h3>
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          {mission.phaseLabels && (
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {mission.phaseLabels.map((p) => (
                <div key={p.label} className="p-4 rounded-xl border border-[#e2e8f0] dark:border-white/10">
                  <div className={`text-xs font-black ${p.color} tracking-widest mb-1`}>{p.label}</div>
                  <div className="text-xs text-[#94a3b8]">{p.sub}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap gap-4">
          <a
            href="/#contact"
            className="px-6 py-3 rounded-xl bg-[#10b981] text-white font-bold hover:bg-[#059669] transition-colors text-sm"
          >
            Get involved
          </a>
          <a
            href="https://github.com/buildersacademyai/drishti"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-[#e2e8f0] dark:border-white/10 text-[#0f172a] dark:text-white font-semibold hover:bg-[#f8fafc] dark:hover:bg-[#0f172a] transition-colors text-sm"
          >
            View on GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
