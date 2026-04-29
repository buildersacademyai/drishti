export function Footer() {
  return (
    <footer className="py-10 bg-[#1a1a2e] text-[#9ca3af]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-bold text-white text-lg">Drishti</div>
        <div className="text-sm text-center">
          Open-source · Apache 2.0 · UNICEF Venture Fund Applicant 2026
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a
            href="https://github.com/drishti-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a href="mailto:hello@drishti.health" className="hover:text-white transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
