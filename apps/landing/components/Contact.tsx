"use client";
import { motion } from "framer-motion";

export function Contact() {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <h2 className="text-4xl font-bold text-[#1a1a2e] mb-4">Get in touch.</h2>
          <p className="text-lg text-[#6b7280] mb-10">
            Are you a public health authority, NGO, or researcher working on vector surveillance?
            We want to hear from you — especially if you operate in a climate-vulnerable region.
          </p>

          <div className="space-y-4">
            <a
              href="mailto:hello@drishti.health"
              className="flex items-center gap-3 p-4 rounded-xl border border-[#e5e7eb] hover:border-[#1e3a5f] transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                @
              </div>
              <div>
                <div className="font-medium text-[#1a1a2e]">Email</div>
                <div className="text-sm text-[#6b7280]">hello@drishti.health</div>
              </div>
            </a>

            <a
              href="https://github.com/drishti-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-[#e5e7eb] hover:border-[#1e3a5f] transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors font-bold text-sm">
                GH
              </div>
              <div>
                <div className="font-medium text-[#1a1a2e]">GitHub</div>
                <div className="text-sm text-[#6b7280]">github.com/drishti-platform</div>
              </div>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
