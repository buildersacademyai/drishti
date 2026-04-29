"use client";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-16 bg-[#f8f7f4]">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
            UNICEF Venture Fund Applicant · May 2026
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-[#1a1a2e] leading-tight mb-6">
            See it from space.{" "}
            <span className="text-[#1e3a5f]">Confirm it from the sky.</span>{" "}
            Stop it before it spreads.
          </h1>

          <p className="text-xl text-[#6b7280] leading-relaxed mb-10 max-w-2xl">
            An open-source, AI-driven platform that combines satellite screening and drone
            verification to predict and prevent vector-borne disease outbreaks in
            climate-vulnerable communities.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#solution"
              className="px-8 py-3 rounded-lg bg-[#1e3a5f] text-white font-semibold hover:bg-[#2d5a8e] transition-colors"
            >
              See how it works
            </a>
            <a
              href="https://github.com/drishti-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg border-2 border-[#1e3a5f] text-[#1e3a5f] font-semibold hover:bg-[#1e3a5f]/5 transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 gap-4 rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-lg"
        >
          <div className="aspect-video bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f]/40 text-sm">
            [Sentinel-2 NDWI map — Chitwan district]
          </div>
          <div className="aspect-video bg-[#1e3a5f]/5 flex items-center justify-center text-[#1e3a5f]/40 text-sm">
            [Drone nano-shot — water surface close-up]
          </div>
        </motion.div>
      </div>
    </section>
  );
}
