"use client";
import { motion } from "framer-motion";

const stack = [
  { name: "FastAPI", category: "Backend", color: "bg-green-500/10 border-green-500/20 text-green-400" },
  { name: "PostGIS", category: "Database", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  { name: "YOLOv8", category: "CV Survey", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  { name: "EfficientNet-B0", category: "CV Nano-shot", color: "bg-pink-500/10 border-pink-500/20 text-pink-400" },
  { name: "XGBoost", category: "Prediction", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
  { name: "Next.js 14", category: "Frontend", color: "bg-white/5 border-white/10 text-white" },
  { name: "MapLibre GL", category: "Maps", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" },
  { name: "Sentinel-2", category: "Satellite", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" },
  { name: "Celery + Redis", category: "Task Queue", color: "bg-red-500/10 border-red-500/20 text-red-400" },
  { name: "Docker", category: "Infrastructure", color: "bg-sky-500/10 border-sky-500/20 text-sky-400" },
  { name: "PyTorch 2", category: "ML Framework", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
  { name: "Apache 2.0", category: "License", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
];

export function Technology() {
  return (
    <section id="technology" className="py-28 bg-[#f8f7f4]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#1e3a5f] uppercase tracking-[0.2em] mb-4">
            Technology
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#1a1a2e] mb-6 max-w-3xl leading-tight">
            Built open.{" "}
            <span style={{ color: "#f59e0b" }}>Built local.</span>
          </h2>
          <p className="text-lg text-[#6b7280] max-w-2xl leading-relaxed">
            Every component is open-source. Data stays in-country. The drone airframe
            reuses existing agricultural spray hardware — no new equipment, no vendor
            lock-in, deployable in any country.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
          {stack.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={`p-4 rounded-xl border ${item.color} flex flex-col gap-1`}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-60">
                {item.category}
              </div>
              <div className="font-bold text-sm text-[#1a1a2e]">{item.name}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-4"
        >
          {[
            { icon: "⚡", title: "No cloud required", desc: "Runs on a single VPS. MinIO replaces S3. All processing stays in-country." },
            { icon: "🔓", title: "Fully open-source", desc: "Apache 2.0. All code, all models, all pipelines. Fork, audit, contribute." },
            { icon: "🌍", title: "Country-agnostic", desc: "Recursive admin hierarchy works for Nepal, India, Bangladesh, Kenya — any country's structure." },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/15"
            >
              <div className="text-2xl mb-3">{c.icon}</div>
              <div className="font-bold text-[#1a1a2e] mb-2">{c.title}</div>
              <div className="text-sm text-[#6b7280] leading-relaxed">{c.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
