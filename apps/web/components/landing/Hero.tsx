"use client";
import { motion } from "framer-motion";

// Node centers trace a descending path (400x400 viewBox) — satellite highest,
// intervention lowest, echoing the headline's "space to ground" arc. Straight
// segments (not a smoothed curve) so the traveling pulse dot's motion matches
// the drawn line exactly.
const pipelineNodes = [
  {
    tier: "Tier 1",
    icon: "🛰️",
    title: "Satellite",
    cx: 90,
    cy: 80,
    stroke: "stroke-blue-500",
    strokeHover: "group-hover:stroke-blue-300",
    fill: "fill-blue-500/10",
    glow: "drop-shadow-[0_0_0px_rgba(59,130,246,0)] group-hover:drop-shadow-[0_0_14px_rgba(59,130,246,0.7)]",
    labelColor: "fill-[#f59e0b]",
  },
  {
    tier: "Tier 2",
    icon: "🚁",
    title: "Drone Survey",
    cx: 280,
    cy: 140,
    stroke: "stroke-amber-500",
    strokeHover: "group-hover:stroke-amber-300",
    fill: "fill-amber-500/10",
    glow: "drop-shadow-[0_0_0px_rgba(245,158,11,0)] group-hover:drop-shadow-[0_0_14px_rgba(245,158,11,0.7)]",
    labelColor: "fill-[#f59e0b]",
  },
  {
    tier: "Tier 2b",
    icon: "🔬",
    title: "Nano-Shot",
    cx: 150,
    cy: 260,
    stroke: "stroke-amber-500",
    strokeHover: "group-hover:stroke-amber-300",
    fill: "fill-amber-500/10",
    glow: "drop-shadow-[0_0_0px_rgba(245,158,11,0)] group-hover:drop-shadow-[0_0_14px_rgba(245,158,11,0.7)]",
    labelColor: "fill-[#f59e0b]",
  },
  {
    tier: "Tier 3",
    icon: "💧",
    title: "Intervention",
    cx: 310,
    cy: 316,
    stroke: "stroke-green-500",
    strokeHover: "group-hover:stroke-green-300",
    fill: "fill-green-500/10",
    glow: "drop-shadow-[0_0_0px_rgba(34,197,94,0)] group-hover:drop-shadow-[0_0_14px_rgba(34,197,94,0.7)]",
    labelColor: "fill-[#22c55e]",
  },
];

const pipelinePath = pipelineNodes.map((n) => `${n.cx},${n.cy}`).join(" L ");

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050d1a]">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#1e3a5f]/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#f59e0b]/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#1e3a5f]/20 blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b] text-xs font-semibold mb-8 tracking-wider uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
              Open-Source · Apache 2.0
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-6"
            >
              See it from{" "}
              <span className="gradient-text">space.</span>
              <br />
              Confirm it from{" "}
              <span className="gradient-text">the sky.</span>
              <br />
              Respond before{" "}
              <span className="text-white">it's too late.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/60 leading-relaxed mb-10 max-w-xl"
            >
              An AI-driven platform combining satellite screening, autonomous drone
              verification, and precision response — for disease control, fire control,
              animal surveillance, flood monitoring, and emergency delivery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="#solution"
                className="px-6 py-3 rounded-xl bg-[#f59e0b] text-[#050d1a] font-bold hover:bg-[#fbbf24] transition-colors text-sm"
              >
                See how it works
              </a>
              <a
                href="https://github.com/buildersacademyai/drishti"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors text-sm"
              >
                View on GitHub
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-14 grid grid-cols-3 gap-6 pt-10 border-t border-white/10"
            >
              {[
                { value: "5", label: "Response domains" },
                { value: "72h", label: "Flag to response" },
                { value: "80%", label: "Less resource waste" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black gradient-text mb-1">{s.value}</div>
                  <div className="text-xs text-white/40">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — visual placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="relative aspect-square rounded-2xl border border-white/10 shadow-2xl bg-gradient-to-br from-[#0d2137] to-[#050d1a] p-6">
                <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
                  {/* Connecting path — descends node to node, matches the dot's motion below */}
                  <motion.path
                    d={`M ${pipelinePath}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.1, delay: 0.3, ease: "easeInOut" }}
                  />

                  {/* Traveling pulse — visits each node in sequence, on loop */}
                  <motion.circle
                    r={5}
                    className="fill-white"
                    initial={{ opacity: 0, cx: pipelineNodes[0].cx, cy: pipelineNodes[0].cy }}
                    animate={{
                      opacity: [1, 1, 1, 1, 0],
                      cx: pipelineNodes.map((n) => n.cx).concat(pipelineNodes[0].cx),
                      cy: pipelineNodes.map((n) => n.cy).concat(pipelineNodes[0].cy),
                    }}
                    transition={{
                      duration: 3.6,
                      delay: 1.6,
                      repeat: Infinity,
                      repeatDelay: 0.6,
                      ease: "easeInOut",
                      times: [0, 0.28, 0.56, 0.84, 1],
                    }}
                    style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))" }}
                  />

                  {/* Nodes */}
                  {pipelineNodes.map((n, i) => (
                    <motion.g
                      key={n.tier}
                      className="group cursor-pointer"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.18 }}
                      style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
                    >
                      <circle
                        cx={n.cx}
                        cy={n.cy}
                        r={34}
                        className={`${n.fill} ${n.stroke} ${n.strokeHover} ${n.glow} transition-all duration-300`}
                        strokeWidth={2}
                      />
                      <text
                        x={n.cx}
                        y={n.cy + 8}
                        textAnchor="middle"
                        fontSize={26}
                        className="select-none"
                      >
                        {n.icon}
                      </text>
                      <text
                        x={n.cx}
                        y={n.cy + 54}
                        textAnchor="middle"
                        fontSize={9}
                        fontWeight={700}
                        letterSpacing={1}
                        className={`${n.labelColor} uppercase select-none`}
                      >
                        {n.tier}
                      </text>
                      <text
                        x={n.cx}
                        y={n.cy + 67}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={600}
                        className="fill-white select-none"
                      >
                        {n.title}
                      </text>
                    </motion.g>
                  ))}
                </svg>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 glass rounded-xl px-4 py-3 shadow-xl">
                <div className="text-white/70 text-xs mb-0.5">Cycle time</div>
                <div className="text-white font-bold text-sm">4–5 days vs. 2–4 <span className="text-white/40">weeks</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
