"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

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
          ? "bg-white/95 backdrop-blur-md border-b border-[#ffffff] dark:border-white/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 mt-8">
          
            <img src="/logo.png" alt="Drishti" className="w-28 h-28 rounded-lg object-contain" />
          
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-[#64748b] dark:text-[#94a3b8]">
          <a href="#scopes" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">Scopes</a>
          <a href="#problem" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">Problem</a>
          <a href="#solution" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">Solution</a>
          <a href="#process" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">Process</a>
          <a href="#team" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">Team</a>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-[#10b981] text-white text-sm font-bold hover:bg-[#059669] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
