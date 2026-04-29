"use client";
import Link from "next/link";

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f8f7f4]/90 backdrop-blur border-b border-[#e5e7eb]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-bold text-lg text-[#1e3a5f]">Drishti</span>
        <div className="flex items-center gap-6 text-sm text-[#6b7280]">
          <a href="#solution" className="hover:text-[#1e3a5f] transition-colors">Solution</a>
          <a href="#technology" className="hover:text-[#1e3a5f] transition-colors">Technology</a>
          <a href="#team" className="hover:text-[#1e3a5f] transition-colors">Team</a>
          <a
            href="https://github.com/drishti-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
