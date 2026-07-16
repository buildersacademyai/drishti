"use client";
import { motion } from "framer-motion";

const channels = [
  {
    icon: "📧",
    title: "Email us",
    value: "contact@buildersacademy.ai",
    href: "mailto:contact@buildersacademy.ai",
  },
  {
    icon: "💻",
    title: "GitHub",
    value: "github.com/buildersacademyai/drishti",
    href: "https://github.com/buildersacademyai/drishti",
  },
  {
    icon: "🌐",
    title: "BuildersAcademy.ai",
    value: "buildersacademy.ai",
    href: "https://buildersacademy.ai",
  },
];

export function Contact() {
  return (
    <section id="contact" className="py-28 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-xs font-bold text-[#0f172a] uppercase tracking-[0.2em] mb-4">
              Get Involved
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[#0f172a] mb-6 leading-tight">
              Partner with us.{" "}
              <span style={{ color: "#38bdf8" }}>Build with us.</span>
            </h2>
            <p className="text-lg text-[#64748b] leading-relaxed mb-8">
              Are you a public health authority, emergency response agency, NGO, research
              institution, or developer working on climate-response challenges? We want to
              hear from you — especially if you operate in a region facing disease,
              wildfire, flooding, wildlife, or emergency-logistics challenges.
            </p>

            <div className="space-y-3">
              {[
                { role: "Health authorities", cta: "Pilot with us in your district" },
                { role: "Developers", cta: "Contribute on GitHub — Apache 2.0" },
                { role: "Researchers", cta: "Access anonymized datasets for study" },
                { role: "Funders", cta: "Support open-source public health infrastructure" },
              ].map((c) => (
                <div key={c.role} className="flex items-center gap-3 p-4 rounded-xl border border-[#e2e8f0] bg-white">
                  <div className="w-2 h-2 rounded-full bg-[#10b981] flex-shrink-0" />
                  <div>
                    <span className="font-bold text-[#0f172a] text-sm">{c.role}: </span>
                    <span className="text-sm text-[#64748b]">{c.cta}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {channels.map((c) => (
              <a
                key={c.title}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 p-6 rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#0f172a] hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0f172a]/10 flex items-center justify-center text-2xl group-hover:bg-[#0f172a] transition-colors">
                  {c.icon}
                </div>
                <div>
                  <div className="font-bold text-[#0f172a]">{c.title}</div>
                  <div className="text-sm text-[#64748b]">{c.value}</div>
                </div>
                <div className="ml-auto text-[#0f172a] opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
