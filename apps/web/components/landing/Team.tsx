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
];

const PHOTO_EXTENSIONS = ["jpg", "jpeg", "png"];

function Avatar({ photo, name, accent }: { photo: number; name: string; accent: boolean }) {
  const [extIdx, setExtIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-black mb-6 ${
        accent ? "bg-[#38bdf8] text-[#0f172a]" : "bg-[#0f172a]/10 text-[#0f172a]"
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
    <section id="team" className="py-28 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-xs font-bold text-[#0f172a] uppercase tracking-[0.2em] mb-4">
            The Team
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#0f172a] mb-6 max-w-3xl leading-tight">
            Built by drone engineers and{" "}
            <span style={{ color: "#38bdf8" }}>public health experts.</span>
          </h2>
          <p className="text-lg text-[#64748b] max-w-2xl leading-relaxed">
            A cross-disciplinary team combining deep software engineering, epidemiology
            expertise, and operational drone experience in Nepal.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-2xl border ${
                m.accent
                  ? "bg-[#0f172a] border-[#0f172a]"
                  : "bg-white border-[#e2e8f0]"
              }`}
            >
              <Avatar photo={m.photo} name={m.name} accent={m.accent} />

              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${m.accent ? "text-[#38bdf8]" : "text-[#0f172a]"}`}>
                {m.org}
              </div>
              <div className={`font-black text-lg mb-1 ${m.accent ? "text-white" : "text-[#0f172a]"}`}>
                {m.name}
              </div>
              <div className={`text-sm font-medium mb-1 ${m.accent ? "text-white/70" : "text-[#0f172a]"}`}>
                {m.role}
              </div>
              <div className={`text-xs mb-4 ${m.accent ? "text-white/40" : "text-[#94a3b8]"}`}>
                {m.focus}
              </div>
              <div className={`text-sm leading-relaxed ${m.accent ? "text-white/70" : "text-[#64748b]"}`}>
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
          className="mt-8 p-6 rounded-2xl bg-[#0f172a]/5 border border-[#0f172a]/15 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div>
            <div className="font-black text-[#0f172a] text-lg">BuildersAcademy.ai</div>
            <div className="text-sm text-[#64748b]">Platform engineering and AI research lead behind Drishti</div>
          </div>
          <a
            href="https://buildersacademy.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#0f172a] text-white text-sm font-semibold hover:bg-[#1e293b] transition-colors flex-shrink-0"
          >
            buildersacademy.ai →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
