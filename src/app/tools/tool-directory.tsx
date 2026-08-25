"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { CATEGORIES, type CategoryKey } from "@/constants/app";
import { TOOLS, getToolBySlug } from "@/lib/tools/registry";
import { isConversionTool } from "@/lib/tools/types";
import { searchTools } from "@/lib/tools/search";
import { useFavoriteSlugs, useRecentSlugs } from "@/lib/storage/tool-activity";

/** How many tag chips to show before the row becomes noise. */
const VISIBLE_TAG_LIMIT = 12;

const chipClasses = (active: boolean): string =>
  `rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
    active
      ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-200 shadow-[0_0_16px_-6px_rgba(139,92,246,0.7)]"
      : "border-white/10 bg-white/[0.03] text-ink-300 hover:border-indigo-400/30 hover:bg-white/[0.06] hover:text-white"
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
  const [showAdvanced, setShowAdvanced] = useState(false);
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
      <section className="glass-panel relative mb-6 overflow-hidden p-4 sm:p-5" aria-label="Filter tools">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white">Search & filter</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Try “json”, “pdf”, “timer”, or a format pair
            </p>
          </div>
          <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
            {TOOLS.length} available
          </span>
        </div>

        <label className="relative mb-4 block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
          <span className="sr-only">Search tools</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools — JSON to XML, jpeg, word counter…"
            className="field w-full py-3.5 pl-12 pr-10"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-500 hover:bg-white/10 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        {/* Category filters with counts */}
        <div className="flex flex-wrap gap-1.5" aria-label="Tool categories">
          <button type="button" onClick={() => setCategory("all")} className={chipClasses(category === "all")}>
            All tools <span className="ml-1 opacity-60">{TOOLS.length}</span>
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setCategory(item.key)}
              className={chipClasses(category === item.key)}
            >
              {item.label}{" "}
              <span className="ml-1 opacity-60">{categoryCounts.get(item.key) ?? 0}</span>
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

        {/* Advanced format filters — collapsed by default to keep the flow clean */}
        <div className="mt-4 border-t border-white/[0.06] pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced((value) => !value)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 transition-colors hover:text-indigo-300"
            aria-expanded={showAdvanced}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showAdvanced ? "Hide format filters" : "Filter by source / output format"}
          </button>

          {showAdvanced && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-400">Source format</span>
                <select
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  className="field"
                >
                  <option value="all">All source formats</option>
                  {sourceFormats.map((format) => (
                    <option key={format}>{format}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-400">Output format</span>
                <select
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  className="field"
                >
                  <option value="all">All output formats</option>
                  {destinationFormats.map((format) => (
                    <option key={format}>{format}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        {/* Tags cut across categories ("pdf", "json") and are derived from the
            registry, so a new tool's tags appear here without another edit. */}
        {topTags.length > 0 && (
          <div
            className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/[0.06] pt-3"
            aria-label="Filter by tag"
          >
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-ink-500">
              Tags
            </span>
            {topTags.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setTag((current) => (current === label ? null : label))}
                aria-pressed={tag === label}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  tag === label
                    ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300"
                    : "border-white/10 bg-transparent text-ink-500 hover:border-white/20 hover:text-ink-200"
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
          <h2 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Recently used
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentTools.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-100 transition-colors hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-indigo-200"
              >
                {isConversionTool(tool)
                  ? `${tool.conversion.fromFormat} → ${tool.conversion.toFormat}`
                  : tool.name}
                <ArrowRight className="h-3 w-3 text-ink-500" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-ink-400">
          <span className="font-bold text-white">{tools.length}</span> tool
          {tools.length === 1 ? "" : "s"}
          {filtersActive ? " match" : ""}
        </p>
        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
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
                className="group card-hover relative flex min-h-44 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/0 to-transparent transition-all duration-300 group-hover:via-indigo-400/60" />
                <button
                  type="button"
                  onClick={() => toggleFavorite(tool.slug)}
                  aria-pressed={isFavorite}
                  aria-label={
                    isFavorite
                      ? `Remove ${tool.name} from favorites`
                      : `Add ${tool.name} to favorites`
                  }
                  className={`absolute right-3 top-3 z-10 rounded-lg p-1.5 transition-colors hover:bg-white/10 ${
                    isFavorite ? "text-amber-300" : "text-ink-600 hover:text-amber-200"
                  }`}
                >
                  <Star
                    className={`h-4 w-4 ${isFavorite ? "fill-amber-300" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                <span className="mb-3 w-fit rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  {tool.category}
                </span>
                <h3 className="pr-8 text-lg font-extrabold leading-snug text-white sm:text-xl">
                  {isConversionTool(tool) ? (
                    <>
                      {tool.conversion.fromFormat}{" "}
                      <span className="text-cyan-400">→</span> {tool.conversion.toFormat}
                    </>
                  ) : (
                    tool.name
                  )}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-400">{tool.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5" aria-hidden="true">
                  {tool.tags.slice(0, 3).map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-ink-500"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-300 transition-colors group-hover:text-cyan-300">
                  {isConversionTool(tool) ? "Open converter" : "Open tool"}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5"
                    aria-hidden="true"
                  />
                </span>
                <Link
                  href={tool.href}
                  className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                >
                  <span className="sr-only">
                    {isConversionTool(tool)
                      ? `${tool.name} — open converter`
                      : `${tool.name} — open tool`}
                  </span>
                </Link>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <Search className="mx-auto mb-4 h-8 w-8 text-ink-500" />
          <h2 className="text-lg font-bold text-white">No matching tool</h2>
          <p className="mt-2 text-sm text-ink-400">
            Try another search term or clear the active filters.
          </p>
          <button type="button" onClick={clearFilters} className="btn-primary mt-5">
            Show all tools
          </button>
        </section>
      )}
    </>
  );
}
