import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { APP_NAME, BRAND_NAME_PARTS } from "@/constants/brand";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label={`${APP_NAME} Home`}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            {BRAND_NAME_PARTS.lead}<span className="text-cyan-400">{BRAND_NAME_PARTS.accent}</span>
          </span>
        </Link>
        {/* "Tools Directory" and "Start Converting" both pointed at /tools, so the
            duplicate link is merged into the single corner call to action. */}
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-ink-200" aria-label="Main navigation">
          <Link href="/#how-it-works" className="hidden sm:block hover:text-cyan-400 transition-colors">How It Works</Link>
          <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/20 px-3.5 py-2 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors font-semibold">
            Start Converting
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
