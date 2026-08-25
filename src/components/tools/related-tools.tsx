"use client";

import Link from "next/link";
import { TOOLS } from "@/lib/tools/registry";
import { isConversionTool } from "@/lib/tools/types";
import { getRelatedToolSlugs } from "@/lib/tools/related";

interface RelatedToolsProps {
  currentSlug: string;
  maxTools?: number;
}

export default function RelatedTools({ currentSlug, maxTools = 4 }: RelatedToolsProps) {
  const relatedTools = getRelatedToolSlugs(currentSlug)
    .map((slug) => TOOLS.find((tool) => tool.slug === slug))
    .filter((tool): tool is (typeof TOOLS)[0] => tool !== undefined)
    .slice(0, maxTools);

  if (relatedTools.length === 0) return null;

  return (
    <section className="mt-12 border-t border-white/[0.06] pt-8" aria-label="Related tools">
      <h3 className="meta mb-4 text-ink-500">Tools you may need</h3>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {relatedTools.map((tool) => (
          <Link
            key={tool.slug}
            href={tool.href}
            className="min-w-[200px] flex-1 border border-white/10 px-4 py-3 motion-nav hover:border-indigo-400/40"
          >
            <span className="block font-semibold text-white">
              {isConversionTool(tool)
                ? `${tool.conversion.fromFormat} → ${tool.conversion.toFormat}`
                : tool.name}
            </span>
            <span className="mt-1 block text-xs text-ink-500">{tool.summary}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export { getRelatedToolSlugs } from "@/lib/tools/related";
