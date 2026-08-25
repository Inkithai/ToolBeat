import Breadcrumbs from "@/components/layout/breadcrumbs";
import CapabilityBadges from "./capability-badges";
import RecordToolVisit from "./record-tool-visit";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbJsonLd, toolJsonLd } from "@/lib/seo/schema";
import type { ToolDefinition } from "@/lib/tools/types";
import RelatedTools from "./related-tools";
import ToolFeedback from "./tool-feedback";

/**
 * Shared page furniture for a tool: breadcrumbs, title, summary and capability
 * badges, plus the tool's structured data.
 *
 * Deliberately *not* a universal tool component. It owns the chrome that is
 * genuinely identical across tools and renders `children` for the part that is
 * not — a converter's dropzone, a formatter's textarea and a timer's countdown
 * have nothing meaningful in common, and forcing them through one abstraction
 * would cost more than it saves.
 *
 * The same breadcrumb items feed the visible trail and the BreadcrumbList
 * structured data, so the two cannot disagree.
 */
const breadcrumbItemsFor = (tool: ToolDefinition) => [
  { name: "Home", href: "/" },
  { name: "Tools", href: "/tools" },
  { name: tool.name, href: tool.href },
];

export default function ToolShell({
  tool,
  children,
}: {
  tool: ToolDefinition;
  children: React.ReactNode;
}) {
  return (
    <main className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-indigo-500/15 blur-[90px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 top-40 h-48 w-48 rounded-full bg-cyan-500/10 blur-[80px]" aria-hidden="true" />

      {/* The visit is recorded for the directory's "Recently used" row. */}
      <RecordToolVisit slug={tool.slug} />
      <JsonLd data={toolJsonLd(tool)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItemsFor(tool))} />

      <Breadcrumbs items={breadcrumbItemsFor(tool)} className="relative mb-8" />

      <header className="glass-panel relative mb-8 overflow-hidden p-6 sm:p-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/55 to-transparent" />
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-400">
          {tool.category}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {tool.name}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-300">{tool.summary}</p>
        <CapabilityBadges capabilities={tool.capabilities} className="mt-5" />
      </header>

      <div className="surface-raised relative p-5 sm:p-6">{children}</div>
      <ToolFeedback toolName={tool.slug} />
      <RelatedTools currentSlug={tool.slug} />
    </main>
  );
}
