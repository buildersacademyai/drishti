"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050d1a]/95 backdrop-blur-md border-b border-white/10 shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#fb923c] flex items-center justify-center">
            <span className="text-[#050d1a] font-black text-sm">D</span>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Drishti</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#scopes" className="hover:text-white transition-colors">Scopes</a>
          <a href="#problem" className="hover:text-white transition-colors">Problem</a>
          <a href="#solution" className="hover:text-white transition-colors">Solution</a>
          <a href="#process" className="hover:text-white transition-colors">Process</a>
          <a href="#team" className="hover:text-white transition-colors">Team</a>
        </div>

        <Link
          href="/login"
          className="px-4 py-2 rounded-lg bg-[#f59e0b] text-[#050d1a] text-sm font-bold hover:bg-[#fbbf24] transition-colors"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}
