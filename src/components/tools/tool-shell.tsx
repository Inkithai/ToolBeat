import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CapabilityBadges from "./capability-badges";
import type { ToolDefinition } from "@/lib/tools/types";

/**
 * Shared page furniture for a tool: back link, title, summary and capability
 * badges.
 *
 * Deliberately *not* a universal tool component. It owns the chrome that is
 * genuinely identical across tools and renders `children` for the part that is
 * not — a converter's dropzone, a formatter's textarea and a timer's countdown
 * have nothing meaningful in common, and forcing them through one abstraction
 * would cost more than it saves.
 */
export default function ToolShell({
  tool,
  children,
}: {
  tool: ToolDefinition;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/tools"
        className="mb-6 inline-flex items-center gap-2 text-sm text-ink-200 transition-colors hover:text-cyan-400"
      >
        <ArrowLeft className="h-4 w-4" /> Tools Directory
      </Link>

      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">{tool.category}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{tool.name}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-200">{tool.summary}</p>
        <CapabilityBadges capabilities={tool.capabilities} className="mt-4" />
      </header>

      {children}
    </main>
  );
}
