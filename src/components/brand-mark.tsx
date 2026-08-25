import { BRAND_NAME_PARTS } from "@/constants/brand";

type BrandMarkProps = { compact?: boolean; showName?: boolean };

/** The ToolBeat mark: a precise pulse crossing a compact utility grid. */
export default function BrandMark({ compact = false, showName = true }: BrandMarkProps) {
  const size = compact ? "h-8 w-8 rounded-md" : "h-9 w-9 rounded-lg";
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`relative inline-flex ${size} shrink-0 items-center justify-center overflow-hidden bg-indigo-500`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="relative h-[62%] w-[62%] fill-none stroke-white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h3l2-5 3 10 2-5h2l1-3 1 3h4" />
          <path d="M4 5.5h16M4 18.5h16" className="opacity-35" />
        </svg>
      </span>
      {showName && (
        <span className="text-lg font-bold tracking-tight text-white">
          {BRAND_NAME_PARTS.lead}
          <span className="text-indigo-300">{BRAND_NAME_PARTS.accent}</span>
        </span>
      )}
    </span>
  );
}
