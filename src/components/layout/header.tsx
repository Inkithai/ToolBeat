import Link from "next/link";
import { ArrowRight, Grid3X3 } from "lucide-react";
import { APP_NAME, BRAND_NAME_PARTS } from "@/constants/brand";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label={`${APP_NAME} Home`}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <Grid3X3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            {BRAND_NAME_PARTS.lead}<span className="text-indigo-400">{BRAND_NAME_PARTS.accent}</span>
          </span>
        </Link>
        {/* Navigation updated for ToolBeat platform - Tools Directory and Browse Categories */}
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-ink-200" aria-label="Main navigation">
          <Link href="/#how-it-works" className="hidden sm:block hover:text-indigo-400 transition-colors">How It Works</Link>
          <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-400/20 px-3.5 py-2 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors font-semibold">
            Browse Tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
