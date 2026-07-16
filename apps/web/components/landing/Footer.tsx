export function Footer() {
  return (
    <footer className="bg-white border-t border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Drishti" className="w-32 h-32 rounded-lg object-contain" />
            </div>
            <p className="text-[#64748b] text-sm leading-relaxed max-w-xs">
              Open-source AI platform for satellite-to-drone disease control, fire
              response, wildlife protection, flood monitoring, and emergency delivery.
              Built in Kathmandu. Runs anywhere.
            </p>
            <div className="mt-4 text-xs text-[#94a3b8]">
              A product of{" "}
              <a
                href="https://buildersacademy.ai"
                className="text-[#0284c7] hover:text-[#38bdf8] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                BuildersAcademy.ai
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-4">Platform</div>
            <div className="space-y-2 text-sm text-[#64748b]">
              <a href="#scopes" className="block hover:text-[#0f172a] transition-colors">Scopes</a>
              <a href="#solution" className="block hover:text-[#0f172a] transition-colors">Solution</a>
              <a href="#process" className="block hover:text-[#0f172a] transition-colors">Process</a>
              <a href="#roadmap" className="block hover:text-[#0f172a] transition-colors">Roadmap</a>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-4">Resources</div>
            <div className="space-y-2 text-sm text-[#64748b]">
              <a
                href="https://github.com/buildersacademyai/drishti"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#0f172a] transition-colors"
              >
                GitHub
              </a>
              <a href="mailto:contact@buildersacademy.ai" className="block hover:text-[#0f172a] transition-colors">
                Contact
              </a>
              <a
                href="https://github.com/buildersacademyai/drishti/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#0f172a] transition-colors"
              >
                Apache 2.0 License
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#e2e8f0] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#94a3b8]">
          <div>© 2026 Drishti · Apache 2.0 · Open-source · Kathmandu, Nepal</div>
          <div>Built with purpose by <a href="https://buildersacademy.ai" className="text-[#0284c7]/70 hover:text-[#0284c7] transition-colors" target="_blank" rel="noopener noreferrer">BuildersAcademy.ai</a></div>
        </div>
      </div>
    </footer>
  );
}
