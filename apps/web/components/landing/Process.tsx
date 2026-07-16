"use client";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Sentinel-2 acquisition",
    desc: "ESA Copernicus satellite passes over target districts weekly. Cloud-masked Sentinel-2 L2A tiles are ingested automatically via Google Earth Engine at zero cost.",
    icon: "🌍",
  },
  {
    step: "02",
    title: "NDWI water detection",
    desc: "Normalized Difference Water Index isolates standing water. Week-over-week change detection flags new or growing water bodies. Permanent rivers and reservoirs are excluded via historical mask.",
    icon: "📡",
  },
  {
    step: "03",
    title: "Mission planning",
    desc: "Flagged candidate zones are ranked by area, proximity to settlements, and historical case burden. Top N zones are queued for drone validation. Operator approves the mission in ~15 minutes.",
    icon: "🗺️",
  },
  {
    step: "04",
    title: "Survey drone flight",
    desc: "Autonomous drone flies only to flagged zones at 30m altitude, capturing 5–10cm GSD imagery. YOLOv8 detects standing water, containers, blocked drains, and tire piles across the full zone.",
    icon: "🚁",
  },
  {
    step: "05",
    title: "Nano-shot confirmation",
    desc: "For each high-confidence water surface, the drone descends to 2–5m. EfficientNet-B0 classifier analyzes macro close-ups for larval signatures — turbidity, organic film, container type, visible larvae.",
    icon: "🔬",
  },
  {
    step: "06",
    title: "Intervention dispatch",
    desc: "larvae_confirmed detections trigger an intervention mission. Drone returns to base — camera payload swapped for larvicide tank in <5 minutes. Precision spray applied at exact confirmed coordinates.",
    icon: "💧",
  },
  {
    step: "07",
    title: "Risk prediction",
    desc: "XGBoost model fuses satellite trends, confirmed habitat density, IoT sensor readings, and historical case data to generate ward-level outbreak risk scores 4–6 weeks ahead.",
    icon: "📊",
  },
  {
    step: "08",
    title: "Closed-loop audit",
    desc: "Every intervention traces back through detection → flight → mission → satellite pixel. Full georeferenced audit trail with timestamp. FCHVs receive alerts in Nepali. Risk scores updated.",
    icon: "✅",
  },
];

export function Process() {
  return (
    <section id="process" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#0284c7] uppercase tracking-[0.2em] mb-4">
            How It Works
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#0f172a] mb-6 max-w-3xl leading-tight">
            Detect → Verify → Respond → Predict.{" "}
            <span className="gradient-text">One shared pipeline, five missions.</span>
          </h2>
          <p className="text-lg text-[#64748b] max-w-2xl leading-relaxed">
            The same satellite-to-drone architecture powers every scope. Here&apos;s the
            pipeline in action for Disease Control — our most mature, furthest-along implementation.
          </p>
        </motion.div>

        <div className="text-xs font-bold text-[#0284c7] uppercase tracking-[0.2em] mb-6">
          Worked example: Disease Control
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="relative p-6 rounded-2xl bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors group"
            >
              {/* Step connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-[#cbd5e1] to-transparent z-10" />
              )}

              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{s.icon}</span>
                <span className="text-xs font-black text-[#cbd5e1]">{s.step}</span>
              </div>

              <h3 className="text-sm font-bold text-[#0f172a] mb-2">{s.title}</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Phase labels */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "VERIFY", sub: "Steps 1–3 · Satellite", color: "text-[#0284c7]" },
            { label: "VALIDATE", sub: "Steps 4–5 · Drone", color: "text-[#475569]" },
            { label: "EXECUTE", sub: "Steps 6–8 · Intervention + Predict", color: "text-[#059669]" },
          ].map((p) => (
            <div key={p.label} className="p-4 rounded-xl border border-[#e2e8f0]">
              <div className={`text-xs font-black ${p.color} tracking-widest mb-1`}>{p.label}</div>
              <div className="text-xs text-[#94a3b8]">{p.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
