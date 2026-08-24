"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, type CategoryKey } from "@/constants/app";
import { TOOLS } from "@/lib/tools/registry";
import { isConversionTool } from "@/lib/tools/types";

export default function ToolDirectory({ initialCategory = "all" }: { initialCategory?: string }) {
  const validInitialCategory = CATEGORIES.some((category) => category.key === initialCategory)
    ? initialCategory as CategoryKey
    : "all";
  const [category, setCategory] = useState<CategoryKey | "all">(validInitialCategory);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [destination, setDestination] = useState("all");

  const conversions = useMemo(() => TOOLS.filter(isConversionTool), []);
  const sourceFormats = useMemo(
    () => Array.from(new Set(conversions.map((item) => item.conversion.fromFormat))).sort(),
    [conversions],
  );
  const destinationFormats = useMemo(
    () => Array.from(new Set(conversions.map((item) => item.conversion.toFormat))).sort(),
    [conversions],
  );

  const tools = TOOLS.filter((tool) => {
    // Tags are part of the search corpus, which is what makes a cross-cutting
    // query like "pdf" match tools that never mention PDF in their name.
    const searchValue = `${tool.slug} ${tool.name} ${tool.summary} ${tool.tags.join(" ")}`.toLowerCase();
    if (category !== "all" && tool.category !== category) return false;
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery && !searchValue.includes(normalizedQuery)) return false;

    // Format filters only apply to converters; selecting one hides tools that
    // have no formats rather than silently keeping them.
    if (source !== "all" || destination !== "all") {
      if (!isConversionTool(tool)) return false;
      if (source !== "all" && tool.conversion.fromFormat !== source) return false;
      if (destination !== "all" && tool.conversion.toFormat !== destination) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setCategory("all");
    setQuery("");
    setSource("all");
    setDestination("all");
  };

  return (
    <>
      <section className="mb-6 rounded-2xl border border-white/5 bg-white/[0.025] p-4 sm:p-5" aria-label="Filter tools">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Find your tool</h2>
          <span className="text-xs text-slate-500">{TOOLS.length} available</span>
        </div>
        <label className="relative block mb-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <span className="sr-only">Search tools</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools, for example JSON to XML or timer…"
            className="w-full rounded-xl border border-white/10 bg-navy-900 py-3.5 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15"
          />
        </label>

        {/* Keep related fields together so the controls stay compact. */}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-200">Source format</span>
            <select value={source} onChange={(event) => setSource(event.target.value)} className="w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50">
              <option value="all">All source formats</option>
              {sourceFormats.map((format) => <option key={format}>{format}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-200">Output format</span>
            <select value={destination} onChange={(event) => setDestination(event.target.value)} className="w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50">
              <option value="all">All output formats</option>
              {destinationFormats.map((format) => <option key={format}>{format}</option>)}
            </select>
          </label>
        </div>

        {/* Category filters - wrapped to prevent long lines */}
        <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Tool categories">
          <button type="button" onClick={() => setCategory("all")} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${category === "all" ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300" : "border-white/10 bg-white/[0.03] text-ink-200 hover:bg-white/[0.07]"}`}>
            All tools
          </button>
          {CATEGORIES.map((item) => (
            <button key={item.key} type="button" onClick={() => setCategory(item.key)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${category === item.key ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300" : "border-white/10 bg-white/[0.03] text-ink-200 hover:bg-white/[0.07]"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-ink-200"><span className="font-bold text-white">{tools.length}</span> tool{tools.length === 1 ? "" : "s"}</p>
        {(query || category !== "all" || source !== "all" || destination !== "all") && (
          <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      {tools.length ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Available tools">
          {tools.map((tool) => (
            <Link key={tool.slug} href={tool.href} className="group flex min-h-40 flex-col rounded-xl border border-white/5 bg-white/[0.025] p-4 transition-all hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-white/[0.04]">
              <span className="mb-3 w-fit rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{tool.category}</span>
              <h2 className="text-xl font-extrabold text-white">
                {isConversionTool(tool) ? (
                  <>
                    {tool.conversion.fromFormat} <span className="text-cyan-400">→</span> {tool.conversion.toFormat}
                  </>
                ) : (
                  tool.name
                )}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-200">{tool.summary}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-cyan-400">
                {isConversionTool(tool) ? "Open converter" : "Open tool"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <Search className="mx-auto mb-4 h-8 w-8 text-slate-500" />
          <h2 className="text-lg font-bold text-white">No matching tool</h2>
          <p className="mt-2 text-sm text-ink-200">Try another search term or clear the active filters.</p>
          <button type="button" onClick={clearFilters} className="mt-5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-400">Show all tools</button>
        </section>
      )}
    </>
  );
}
