"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/constants/app";
import { getToolsByCategory } from "@/lib/tools/registry";
import { isConversionTool } from "@/lib/tools/types";

export default function CategoryDirectory() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <section id="categories" className="scroll-mt-20 border-b border-white/[0.06] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="meta mb-3 text-ink-500">Explore by what you&apos;re doing</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Pick a task family</h2>
          </div>
          <Link href="/tools" className="text-sm font-semibold text-indigo-300 motion-fn hover:text-white">
            Explore all →
          </Link>
        </div>

        <ol className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {CATEGORIES.map((category, index) => {
            const tools = getToolsByCategory(category.key);
            const expanded = openKey === category.key;
            const preview = tools.slice(0, 6);

            return (
              <li
                key={category.key}
                onMouseEnter={() => setOpenKey(category.key)}
                onMouseLeave={() => setOpenKey((current) => (current === category.key ? null : current))}
              >
                <Link
                  href={`/tools?category=${category.key}`}
                  className="group block py-5"
                  onFocus={() => setOpenKey(category.key)}
                  aria-expanded={expanded}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono text-xs text-ink-500">{String(index + 1).padStart(2, "0")}</span>
                        <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">{category.label}</h3>
                      </div>
                      <p className="mt-1 pl-8 text-sm text-ink-400 sm:pl-9">{category.verbs}</p>
                    </div>
                    <span className="meta shrink-0 pl-8 text-ink-400 motion-nav group-hover:text-indigo-300 sm:pl-0">
                      {tools.length} tools →
                    </span>
                  </div>
                  <div
                    className={`grid overflow-hidden pl-8 motion-nav sm:pl-9 ${
                      expanded ? "mt-3 max-h-24 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2">
                      {preview.map((tool) => (
                        <span
                          key={tool.slug}
                          className="border border-white/10 px-2 py-1 font-mono text-[11px] text-ink-300"
                        >
                          {isConversionTool(tool)
                            ? `${tool.conversion.fromFormat} → ${tool.conversion.toFormat}`
                            : tool.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
