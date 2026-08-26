import { BRAND_NAME_PARTS } from "@/constants/brand";

type BrandMarkProps = { compact?: boolean; showName?: boolean };

/** The ConvertLab mark: an Erlenmeyer flask on the indigo gradient tile. */
export default function BrandMark({ compact = false, showName = true }: BrandMarkProps) {
  const size = compact ? "h-8 w-8 rounded-md" : "h-9 w-9 rounded-lg";
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`relative inline-flex ${size} shrink-0 items-center justify-center overflow-hidden bg-indigo-500`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="relative h-[62%] w-[62%] fill-none stroke-white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.5a2 2 0 0 1-.2.9L4.7 20.6a1 1 0 0 0 .9 1.4h12.8a1 1 0 0 0 .9-1.4L14.2 10.4a2 2 0 0 1-.2-.9V2" />
          <path d="M8.5 2h7" />
          <path d="M7 16h10" />
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
