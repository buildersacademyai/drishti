"use client";
import { motion } from "framer-motion";

const stats = [
  { number: "10×", label: "increase in dengue cases in Nepal (2010 → 2024)" },
  { number: "Mid-hills", label: "districts now affected — mosquito-free a decade ago" },
  { number: "40%", label: "of severe dengue cases: children under 15" },
];

export function Problem() {
  return (
    <section id="problem" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-[#1a1a2e] mb-4">
            Climate change is moving disease into new communities.
          </h2>
          <p className="text-lg text-[#6b7280] max-w-2xl mb-16">
            Warming temperatures and shifting monsoon patterns are creating new mosquito breeding
            grounds in Nepal&apos;s mid-hill districts. Current surveillance is paper-based,
            reactive, and operates with a 2–4 week lag. By the time outbreaks are detected,
            hundreds of children are already infected.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-[#f8f7f4] border border-[#e5e7eb]"
            >
              <div className="text-5xl font-bold text-[#f59e0b] mb-3">{stat.number}</div>
              <div className="text-[#6b7280] leading-relaxed">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
