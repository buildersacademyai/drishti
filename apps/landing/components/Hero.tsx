"use client";
import { motion } from "framer-motion";

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
              Stop it before{" "}
              <span className="text-white">it spreads.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/60 leading-relaxed mb-10 max-w-xl"
            >
              An AI-driven platform combining satellite screening, autonomous drone
              verification, and precision intervention to prevent vector-borne disease
              outbreaks in climate-vulnerable communities.
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
                href="https://github.com/drishti-platform"
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
                { value: "72h", label: "Flag to treatment" },
                { value: "10×", label: "Dengue growth in Nepal" },
                { value: "80%", label: "Less chemical use" },
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
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="grid grid-cols-2">
                  <div className="aspect-square bg-gradient-to-br from-[#0d2137] to-[#1e3a5f] flex flex-col items-center justify-center gap-3 p-6 border-r border-white/10">
                    <div className="text-4xl">🛰️</div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-1">Tier 1</div>
                      <div className="text-white font-semibold text-sm">Satellite</div>
                      <div className="text-white/40 text-xs mt-1">Sentinel-2 NDWI</div>
                    </div>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-[#0d2137] to-[#0f3050] flex flex-col items-center justify-center gap-3 p-6">
                    <div className="text-4xl">🚁</div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-1">Tier 2</div>
                      <div className="text-white font-semibold text-sm">Drone Survey</div>
                      <div className="text-white/40 text-xs mt-1">YOLOv8 detection</div>
                    </div>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-[#0f3050] to-[#0d2137] flex flex-col items-center justify-center gap-3 p-6 border-t border-r border-white/10">
                    <div className="text-4xl">🔬</div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-1">Tier 2b</div>
                      <div className="text-white font-semibold text-sm">Nano-Shot</div>
                      <div className="text-white/40 text-xs mt-1">EfficientNet confirm</div>
                    </div>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-[#0f3050] to-[#1a3a1a] flex flex-col items-center justify-center gap-3 p-6 border-t border-white/10">
                    <div className="text-4xl">💧</div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-[#22c55e] uppercase tracking-wider mb-1">Tier 3</div>
                      <div className="text-white font-semibold text-sm">Intervention</div>
                      <div className="text-white/40 text-xs mt-1">Precision spray</div>
                    </div>
                  </div>
                </div>
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
