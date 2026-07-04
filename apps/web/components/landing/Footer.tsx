export function Footer() {
  return (
    <footer className="bg-[#050d1a] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#fb923c] flex items-center justify-center">
                <span className="text-[#050d1a] font-black text-sm">D</span>
              </div>
              <span className="font-bold text-lg text-white">Drishti</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Open-source AI platform for satellite-to-drone disease control, fire
              response, wildlife protection, flood monitoring, and emergency delivery.
              Built in Kathmandu. Runs anywhere.
            </p>
            <div className="mt-4 text-xs text-white/30">
              A product of{" "}
              <a
                href="https://buildersacademy.ai"
                className="text-[#f59e0b] hover:text-[#fbbf24] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                BuildersAcademy.ai
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Platform</div>
            <div className="space-y-2 text-sm text-white/50">
              <a href="#scopes" className="block hover:text-white transition-colors">Scopes</a>
              <a href="#solution" className="block hover:text-white transition-colors">Solution</a>
              <a href="#process" className="block hover:text-white transition-colors">Process</a>
              <a href="#roadmap" className="block hover:text-white transition-colors">Roadmap</a>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Resources</div>
            <div className="space-y-2 text-sm text-white/50">
              <a
                href="https://github.com/buildersacademyai/drishti"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a href="mailto:contact@buildersacademy.ai" className="block hover:text-white transition-colors">
                Contact
              </a>
              <a
                href="https://github.com/buildersacademyai/drishti/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-white transition-colors"
              >
                Apache 2.0 License
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <div>© 2026 Drishti · Apache 2.0 · Open-source · Kathmandu, Nepal</div>
          <div>Built with purpose by <a href="https://buildersacademy.ai" className="text-[#f59e0b]/60 hover:text-[#f59e0b] transition-colors" target="_blank" rel="noopener noreferrer">BuildersAcademy.ai</a></div>
        </div>
      </div>
    </footer>
  );
}
