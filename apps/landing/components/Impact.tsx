"use client";
import { motion } from "framer-motion";

const metrics = [
  { label: "Year 1 target", value: "2 districts · Nepal pilot" },
  { label: "Children protected", value: "~300,000 under 15" },
  { label: "Cycle time", value: "4–5 days vs. 2–4 weeks" },
  { label: "Chemical reduction", value: "60–80% vs. blanket spray" },
  { label: "Coverage cost", value: "~$0 satellite screening" },
  { label: "Flight hour savings", value: "70–80% vs. manual survey" },
];

export function Impact() {
  return (
    <section id="impact" className="py-24 bg-[#f8f7f4]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-[#1a1a2e] mb-4">
            Numbers that matter.
          </h2>
          <p className="text-lg text-[#6b7280] mb-12 max-w-2xl">
            Drishti is designed for measurable outcomes — faster detection, lower cost,
            fewer infections. Every metric traces directly to a design decision.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="p-6 rounded-2xl bg-white border border-[#e5e7eb]"
            >
              <div className="text-xs text-[#9ca3af] uppercase tracking-wider mb-2">
                {m.label}
              </div>
              <div className="text-xl font-bold text-[#1e3a5f]">{m.value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
