"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const members = [
  {
    name: "Binaya Tripathi",
    role: "Founder",
    org: "BuildersAcademy.ai",
    focus: "Vision · Strategy · Partnerships",
    bio: "Founded BuildersAcademy.ai and set the vision for Drishti — turning satellite and drone data into actionable public health intervention.",
    accent: true,
    photo: 0,
  },
  {
    name: "Dipak Sharma",
    role: "Project Lead",
    org: "BuildersAcademy.ai",
    focus: "Backend · ML · Infrastructure · Drone Systems",
    bio: "Building the full satellite-to-drone-to-prediction pipeline. Leads technical architecture, model development, and platform infrastructure at BuildersAcademy.ai.",
    accent: false,
    photo: 1,
  },
  {
    name: "Rishav Subedi",
    role: "Drone Developer",
    org: "BuildersAcademy.ai",
    focus: "UAV Hardware · Flight Firmware · Autonomous Systems",
    bio: "Designs and builds the drone hardware and flight firmware powering low-altitude verification and intervention missions at BuildersAcademy.ai.",
    accent: false,
    photo: 2,
  },
  {
    name: "Field Partner",
    role: "Public Health Advisor",
    org: "Nepal MoHP",
    focus: "Epidemiology · VBD Surveillance · Bagmati Province",
    bio: "Domain expertise on dengue surveillance protocols, EDCD reporting systems, and community health worker networks across Nepal's mid-hill districts.",
    accent: false,
    photo: 3,
  },
];

const PHOTO_EXTENSIONS = ["jpg", "jpeg", "png"];

function Avatar({ photo, name, accent }: { photo: number; name: string; accent: boolean }) {
  const [extIdx, setExtIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-black mb-6 ${
        accent ? "bg-[#f59e0b] text-[#050d1a]" : "bg-[#1e3a5f]/10 text-[#1e3a5f]"
      }`}
    >
      <span>{name.charAt(0)}</span>
      {!failed && (
        <img
          src={`/${photo}.${PHOTO_EXTENSIONS[extIdx]}`}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => {
            if (extIdx < PHOTO_EXTENSIONS.length - 1) setExtIdx(extIdx + 1);
            else setFailed(true);
          }}
        />
      )}
    </div>
  );
}

export function Team() {
  return (
    <section id="team" className="py-28 bg-[#f8f7f4]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#1e3a5f] uppercase tracking-[0.2em] mb-4">
            The Team
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#1a1a2e] mb-6 max-w-3xl leading-tight">
            Built by drone engineers and{" "}
            <span style={{ color: "#f59e0b" }}>public health experts.</span>
          </h2>
          <p className="text-lg text-[#6b7280] max-w-2xl leading-relaxed">
            A cross-disciplinary team combining deep software engineering, epidemiology
            expertise, and operational drone experience in Nepal.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-2xl border ${
                m.accent
                  ? "bg-[#1e3a5f] border-[#1e3a5f]"
                  : "bg-white border-[#e5e7eb]"
              }`}
            >
              <Avatar photo={m.photo} name={m.name} accent={m.accent} />

              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${m.accent ? "text-[#f59e0b]" : "text-[#1e3a5f]"}`}>
                {m.org}
              </div>
              <div className={`font-black text-lg mb-1 ${m.accent ? "text-white" : "text-[#1a1a2e]"}`}>
                {m.name}
              </div>
              <div className={`text-sm font-medium mb-1 ${m.accent ? "text-white/70" : "text-[#1e3a5f]"}`}>
                {m.role}
              </div>
              <div className={`text-xs mb-4 ${m.accent ? "text-white/40" : "text-[#9ca3af]"}`}>
                {m.focus}
              </div>
              <div className={`text-sm leading-relaxed ${m.accent ? "text-white/70" : "text-[#6b7280]"}`}>
                {m.bio}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Org credit */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 p-6 rounded-2xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/15 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div>
            <div className="font-black text-[#1a1a2e] text-lg">BuildersAcademy.ai</div>
            <div className="text-sm text-[#6b7280]">Platform engineering and AI research lead behind Drishti</div>
          </div>
          <a
            href="https://buildersacademy.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#2d5a8e] transition-colors flex-shrink-0"
          >
            buildersacademy.ai →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
