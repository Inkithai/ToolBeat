import { BRAND_NAME_PARTS } from "@/constants/brand";

type BrandMarkProps = { compact?: boolean; showName?: boolean };

/** The ToolBeat mark: a precise pulse crossing a compact utility grid. */
export default function BrandMark({ compact = false, showName = true }: BrandMarkProps) {
  const size = compact ? "h-8 w-8 rounded-lg" : "h-9 w-9 rounded-xl";
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`relative inline-flex ${size} shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 shadow-lg shadow-indigo-500/30`} aria-hidden="true">
        <span className="absolute inset-0 bg-white/10" />
        <svg viewBox="0 0 24 24" className="relative h-[62%] w-[62%] fill-none stroke-white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h3l2-5 3 10 2-5h2l1-3 1 3h4" />
          <path d="M4 5.5h16M4 18.5h16" className="opacity-35" />
        </svg>
      </span>
      {showName && (
        <span className="text-lg font-bold tracking-tight text-white">
          {BRAND_NAME_PARTS.lead}
          <span className="bg-gradient-to-r from-indigo-300 to-cyan-400 bg-clip-text text-transparent">{BRAND_NAME_PARTS.accent}</span>
        </span>
      )}
    </span>
  );
}
