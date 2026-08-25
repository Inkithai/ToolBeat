import { Globe, HardDrive, Save, Weight } from "lucide-react";
import { getCapabilityBadges } from "@/lib/tools/capabilities";
import type { ToolCapabilities } from "@/lib/tools/types";

const ICONS = {
  processing: HardDrive,
  network: Globe,
  persistence: Save,
  limit: Weight,
} as const;

/**
 * Renders a tool's declared capabilities.
 *
 * This is what replaced the fixed "Browser-only" pill: the badges are generated
 * from data, so a tool that behaved differently would say so rather than
 * inheriting a claim written for its neighbours.
 */
export default function CapabilityBadges({
  capabilities,
  className = "",
}: {
  capabilities: ToolCapabilities;
  className?: string;
}) {
  const badges = getCapabilityBadges(capabilities);

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge) => {
        const Icon = ICONS[badge.id as keyof typeof ICONS] ?? HardDrive;
        return (
          <li
            key={badge.id}
            title={badge.detail}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-shadow ${
              badge.tone === "positive"
                ? "border-indigo-400/30 bg-indigo-500/15 text-indigo-200 shadow-[0_0_14px_-6px_rgba(139,92,246,0.55)]"
                : "border-white/10 bg-white/[0.04] text-ink-300"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {badge.label}
          </li>
        );
      })}
    </ul>
  );
}
