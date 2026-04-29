"use client";
import { motion } from "framer-motion";

const members = [
  {
    name: "Dipak Dhakal",
    role: "Lead Engineer",
    focus: "Backend · ML · Infrastructure",
    note: "Building the satellite-to-drone data pipeline and prediction models.",
  },
  {
    name: "Field Partner",
    role: "Public Health Advisor",
    focus: "Epidemiology · Nepal MoHP",
    note: "Domain expertise on dengue surveillance protocols in Bagmati Province.",
  },
  {
    name: "Drone Partner",
    role: "Agricultural Drone Operator",
    focus: "UAV · Precision Spray",
    note: "Existing spray-drone fleet in Chitwan — airframe reuse, no new hardware.",
  },
];

export function Team() {
  return (
    <section id="team" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-[#1a1a2e] mb-4">Who is building this.</h2>
          <p className="text-lg text-[#6b7280] mb-12 max-w-2xl">
            A lean cross-disciplinary team combining software engineering, public health, and
            operational drone expertise in Nepal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {members.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-[#f8f7f4] border border-[#e5e7eb]"
            >
              <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] font-bold text-lg mb-4">
                {m.name.charAt(0)}
              </div>
              <div className="font-bold text-[#1a1a2e] mb-1">{m.name}</div>
              <div className="text-sm font-medium text-[#1e3a5f] mb-1">{m.role}</div>
              <div className="text-xs text-[#9ca3af] mb-3">{m.focus}</div>
              <div className="text-sm text-[#6b7280] leading-relaxed">{m.note}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
