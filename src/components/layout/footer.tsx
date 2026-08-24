import { FlaskConical } from "lucide-react";
import { BRAND_NAME_PARTS, REPOSITORY_URL } from "@/constants/brand";
import { TOOLS } from "@/lib/tools/registry";
import { describePlatformProcessing } from "@/lib/tools/capabilities";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-950 px-6 py-10 text-center text-xs text-ink-200">
      <div className="mb-3 flex items-center justify-center gap-2">
        <FlaskConical className="h-5 w-5 text-cyan-500" />
        <span className="text-sm font-extrabold text-white">{BRAND_NAME_PARTS.lead}<span className="text-cyan-400">{BRAND_NAME_PARTS.accent}</span></span>
      </div>
      {/* Derived from tool capabilities, so this cannot outlive its accuracy. */}
      <p className="mx-auto mb-2 max-w-md">{describePlatformProcessing(TOOLS)}</p>
      <p className="text-ink-800">
        Built with Next.js · Tailwind CSS ·{" "}
        <a
          href={REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-cyan-400 transition-colors font-medium"
        >
          Open source
        </a>
      </p>
    </footer>
  );
}
