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
        <div className="grid lg:grid-cols-2 gap-28 items-center">
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

          {/* Right — drone visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative aspect-square scale-[1.75]">
              {/* Trailing pair — small, faded, blurred, behind the lead; animate in from further/smaller to simulate approach */}
              <motion.img
                src="/drone.svg"
                alt=""
                aria-hidden="true"
                className="absolute z-0 w-[18%] h-[18%] object-contain top-4 left-8 rotate-[-8deg]"
                initial={{ opacity: 0, scale: 0.5, x: -30, y: -20, filter: "blur(3px)" }}
                animate={{ opacity: 0.4, scale: 1, x: 0, y: 0, filter: "blur(1px)" }}
                transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
              />
              <motion.img
                src="/drone.svg"
                alt=""
                aria-hidden="true"
                className="absolute z-0 w-[18%] h-[18%] object-contain top-4 right-8 rotate-[8deg]"
                initial={{ opacity: 0, scale: 0.5, x: 30, y: -20, filter: "blur(3px)" }}
                animate={{ opacity: 0.4, scale: 1, x: 0, y: 0, filter: "blur(1px)" }}
                transition={{ duration: 0.9, delay: 0.55, ease: "easeOut" }}
              />

              {/* Lead drone */}
              <img src="/drone.svg" alt="Drishti drone" className="relative z-10 w-full h-full object-contain" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
