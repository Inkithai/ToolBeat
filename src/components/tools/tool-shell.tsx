import Breadcrumbs from "@/components/layout/breadcrumbs";
import CapabilityBadges from "./capability-badges";
import RecordToolVisit from "./record-tool-visit";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbJsonLd, toolJsonLd } from "@/lib/seo/schema";
import type { ToolDefinition } from "@/lib/tools/types";
import RelatedTools from "./related-tools";
import ToolFeedback from "./tool-feedback";
import { CATEGORIES } from "@/constants/app";

/**
 * Shared page furniture for a tool: breadcrumbs, title, summary and capability
 * badges, plus the tool's structured data.
 *
 * The chrome is the Input → Process → Output identity. `children` is the
 * workspace itself — converters, formatters and timers stay free to differ.
 */
const breadcrumbItemsFor = (tool: ToolDefinition) => {
  const category = CATEGORIES.find((item) => item.key === tool.category);
  return [
    { name: "Home", href: "/" },
    { name: category?.label ?? "Tools", href: `/tools?category=${tool.category}` },
    { name: tool.name, href: tool.href },
  ];
};

export default function ToolShell({
  tool,
  children,
}: {
  tool: ToolDefinition;
  children: React.ReactNode;
}) {
  const crumbs = breadcrumbItemsFor(tool);

  return (
    <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <RecordToolVisit slug={tool.slug} />
      <JsonLd data={toolJsonLd(tool)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <Breadcrumbs items={crumbs} className="relative mb-8" />

      <header className="mb-8 border-b border-white/[0.08] pb-8">
        <p className="meta mb-3 text-ink-500">
          {CATEGORIES.find((item) => item.key === tool.category)?.label ?? tool.category}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {tool.name}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-300">{tool.summary}</p>
        <CapabilityBadges capabilities={tool.capabilities} className="mt-5" />
      </header>

      <div className="relative">{children}</div>
      <ToolFeedback toolName={tool.slug} />
      <RelatedTools currentSlug={tool.slug} />
    </main>
  );
}
