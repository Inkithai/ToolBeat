"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Search, SlidersHorizontal, Star } from "lucide-react";
import { CATEGORIES, type CategoryKey } from "@/constants/app";
import { TOOLS, getToolBySlug } from "@/lib/tools/registry";
import { isConversionTool } from "@/lib/tools/types";
import { searchTools } from "@/lib/tools/search";
import { useFavoriteSlugs, useRecentSlugs } from "@/lib/storage/tool-activity";

/** How many tag chips to show before the row becomes noise. */
const VISIBLE_TAG_LIMIT = 12;

const chipClasses = (active: boolean): string =>
  `rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
    active
      ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
      : "border-white/10 bg-white/[0.03] text-ink-200 hover:bg-white/[0.07]"
  }`;

export default function ToolDirectory({ initialCategory = "all" }: { initialCategory?: string }) {
  const validInitialCategory = CATEGORIES.some((category) => category.key === initialCategory)
    ? (initialCategory as CategoryKey)
    : "all";
  const [category, setCategory] = useState<CategoryKey | "all">(validInitialCategory);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [source, setSource] = useState("all");
  const [destination, setDestination] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, toggleFavorite] = useFavoriteSlugs();
  const [recentSlugs] = useRecentSlugs();

  const conversions = useMemo(() => TOOLS.filter(isConversionTool), []);
  const sourceFormats = useMemo(
    () => Array.from(new Set(conversions.map((item) => item.conversion.fromFormat))).sort(),
    [conversions],
  );
  const destinationFormats = useMemo(
    () => Array.from(new Set(conversions.map((item) => item.conversion.toFormat))).sort(),
    [conversions],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tool of TOOLS) counts.set(tool.category, (counts.get(tool.category) ?? 0) + 1);
    return counts;
  }, []);

  /** Most-used tags, capped; the active tag is always kept visible. */
  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tool of TOOLS) {
      for (const label of tool.tags) counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    const ranked = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([label]) => label);
    const visible = ranked.slice(0, VISIBLE_TAG_LIMIT);
    if (tag && !visible.includes(tag)) visible.push(tag);
    return visible;
  }, [tag]);

  // searchTools handles tokenization, AND-matching across fields, alias
  // expansion and ranking; the remaining filters below are plain predicates.
  const searched = useMemo(() => searchTools(TOOLS, query), [query]);

  const tools = useMemo(
    () =>
      searched.filter((tool) => {
        if (category !== "all" && tool.category !== category) return false;
        if (tag && !tool.tags.includes(tag)) return false;
        if (favoritesOnly && !favorites.includes(tool.slug)) return false;

        // Format filters only apply to converters; selecting one hides tools
        // that have no formats rather than silently keeping them.
        if (source !== "all" || destination !== "all") {
          if (!isConversionTool(tool)) return false;
          if (source !== "all" && tool.conversion.fromFormat !== source) return false;
          if (destination !== "all" && tool.conversion.toFormat !== destination) return false;
        }
        return true;
      }),
    [searched, category, tag, favoritesOnly, favorites, source, destination],
  );

  // Recents would be noise next to an active filter, so they only show on an
  // unfiltered view. Rendered from client state after hydration; the server
  // and first client render agree on "no recents".
  const recentTools = useMemo(
    () =>
      recentSlugs
        .map((slug) => getToolBySlug(slug))
        .filter((tool): tool is (typeof TOOLS)[number] => Boolean(tool)),
    [recentSlugs],
  );

  const filtersActive = Boolean(
    query.trim() || category !== "all" || tag || source !== "all" || destination !== "all" || favoritesOnly,
  );

  const clearFilters = () => {
    setCategory("all");
    setQuery("");
    setTag(null);
    setSource("all");
    setDestination("all");
    setFavoritesOnly(false);
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
            placeholder="Search tools, for example JSON to XML, jpeg or timer…"
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

        {/* Category filters with counts, wrapped to prevent long lines */}
        <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Tool categories">
          <button type="button" onClick={() => setCategory("all")} className={chipClasses(category === "all")}>
            All tools <span className="ml-1 opacity-60">{TOOLS.length}</span>
          </button>
          {CATEGORIES.map((item) => (
            <button key={item.key} type="button" onClick={() => setCategory(item.key)} className={chipClasses(category === item.key)}>
              {item.label} <span className="ml-1 opacity-60">{categoryCounts.get(item.key) ?? 0}</span>
            </button>
          ))}
          {favorites.length > 0 && (
            <button
              type="button"
              onClick={() => setFavoritesOnly((value) => !value)}
              aria-pressed={favoritesOnly}
              className={`${chipClasses(favoritesOnly)} inline-flex items-center gap-1.5`}
            >
              <Star className="h-3 w-3" aria-hidden="true" /> Favorites
              <span className="opacity-60">{favorites.length}</span>
            </button>
          )}
        </div>

        {/* Tags cut across categories ("pdf", "json") and are derived from the
            registry, so a new tool's tags appear here without another edit. */}
        {topTags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3" aria-label="Filter by tag">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tags</span>
            {topTags.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setTag((current) => (current === label ? null : label))}
                aria-pressed={tag === label}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  tag === label
                    ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
                    : "border-white/10 bg-transparent text-slate-400 hover:border-white/20 hover:text-ink-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </section>

      {recentTools.length > 0 && !filtersActive && (
        <section className="mb-6" aria-label="Recently used tools">
          <h2 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Recently used
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentTools.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-100 transition-colors hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-200"
              >
                {isConversionTool(tool)
                  ? `${tool.conversion.fromFormat} → ${tool.conversion.toFormat}`
                  : tool.name}
                <ArrowRight className="h-3 w-3 text-slate-500" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-ink-200"><span className="font-bold text-white">{tools.length}</span> tool{tools.length === 1 ? "" : "s"}</p>
        {filtersActive && (
          <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      {tools.length ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Available tools">
          {tools.map((tool) => {
            const isFavorite = favorites.includes(tool.slug);
            return (
              // The link is stretched over the whole card rather than wrapping
              // it, so the favorite button can sit on top as a sibling instead
              // of as a button nested inside an anchor (invalid HTML).
              <article
                key={tool.slug}
                className="group relative flex min-h-40 flex-col rounded-xl border border-white/5 bg-white/[0.025] p-4 transition-all hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-white/[0.04]"
              >
                <button
                  type="button"
                  onClick={() => toggleFavorite(tool.slug)}
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
                  className={`absolute right-3 top-3 z-10 rounded-lg p-1.5 transition-colors hover:bg-white/10 ${
                    isFavorite ? "text-amber-300" : "text-slate-600 hover:text-amber-200"
                  }`}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? "fill-amber-300" : ""}`} aria-hidden="true" />
                </button>
                <span className="mb-3 w-fit rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{tool.category}</span>
                <h3 className="pr-8 text-xl font-extrabold text-white">
                  {isConversionTool(tool) ? (
                    <>
                      {tool.conversion.fromFormat} <span className="text-cyan-400">→</span> {tool.conversion.toFormat}
                    </>
                  ) : (
                    tool.name
                  )}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-200">{tool.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5" aria-hidden="true">
                  {tool.tags.slice(0, 3).map((label) => (
                    <span key={label} className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      {label}
                    </span>
                  ))}
                </div>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-cyan-400">
                  {isConversionTool(tool) ? "Open converter" : "Open tool"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
                <Link
                  href={tool.href}
                  className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                >
                  <span className="sr-only">
                    {isConversionTool(tool) ? `${tool.name} — open converter` : `${tool.name} — open tool`}
                  </span>
                </Link>
              </article>
            );
          })}
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
