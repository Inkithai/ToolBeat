"use client";

import Link from "next/link";
import { getToolBySlug } from "@/lib/tools/registry";
import { useFavoriteSlugs, useRecentVisits } from "@/lib/storage/tool-activity";
import { formatRelativeTime } from "@/lib/storage/relative-time";
import { isConversionTool } from "@/lib/tools/types";

function toolLabel(slug: string): string | null {
  const tool = getToolBySlug(slug);
  if (!tool) return null;
  return isConversionTool(tool)
    ? `${tool.conversion.fromFormat} → ${tool.conversion.toFormat}`
    : tool.name;
}

export default function PersonalizedHome() {
  const [favorites] = useFavoriteSlugs();
  const [recents, hydrated] = useRecentVisits();

  if (!hydrated) return null;

  const recentTools = recents
    .map((visit) => ({
      slug: visit.slug,
      href: getToolBySlug(visit.slug)?.href,
      label: toolLabel(visit.slug),
      when: visit.visitedAt ? formatRelativeTime(visit.visitedAt) : "",
    }))
    .filter((item): item is { slug: string; href: string; label: string; when: string } =>
      Boolean(item.href && item.label),
    );
  const favoriteTools = favorites
    .map((slug) => ({ slug, href: getToolBySlug(slug)?.href, label: toolLabel(slug) }))
    .filter((item): item is { slug: string; href: string; label: string } => Boolean(item.href && item.label));

  if (recentTools.length === 0 && favoriteTools.length === 0) {
    return (
      <section className="border-b border-white/[0.06] px-4 py-16 sm:px-6" aria-label="My Toolbox">
        <div className="mx-auto max-w-6xl">
          <p className="meta mb-4 text-ink-500">No account required</p>
          <h2 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Use a tool.
            <br />
            It remembers.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-400">
            Your recent tools stay on this device. Favorites live in My Toolbox — still without a signup.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-white/[0.06] px-4 py-16 sm:px-6" aria-label="Welcome back">
      <div className="mx-auto max-w-6xl">
        <p className="meta mb-3 text-cyan-400">Welcome back</p>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Continue where you left off</h2>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {recentTools.length > 0 && (
            <div>
              <p className="meta mb-4 text-ink-500">Recently used</p>
              <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
                {recentTools.slice(0, 5).map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={tool.href}
                      className="flex items-center justify-between gap-4 py-3 text-sm text-ink-200 motion-nav hover:text-white"
                    >
                      <span>{tool.label}</span>
                      <span className="shrink-0 font-mono text-[11px] text-ink-500">{tool.when}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {favoriteTools.length > 0 && (
            <div>
              <p className="meta mb-4 text-ink-500">Favorites</p>
              <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
                {favoriteTools.slice(0, 5).map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={tool.href}
                      className="flex items-center justify-between py-3 text-sm text-ink-200 motion-nav hover:text-white"
                    >
                      <span>★ {tool.label}</span>
                      <span className="text-ink-600">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
