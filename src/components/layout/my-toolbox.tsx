"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, Heart, Wrench, X } from "lucide-react";
import { TOOLS, getToolBySlug } from "@/lib/tools/registry";
import { isConversionTool } from "@/lib/tools/types";
import { useFavoriteSlugs, useRecentVisits } from "@/lib/storage/tool-activity";
import { formatRelativeTime } from "@/lib/storage/relative-time";

function toolLabel(slug: string): string | null {
  const tool = getToolBySlug(slug);
  if (!tool) return null;
  return isConversionTool(tool)
    ? `${tool.conversion.fromFormat} → ${tool.conversion.toFormat}`
    : tool.name;
}

export default function MyToolbox() {
  const [open, setOpen] = useState(false);
  const [favorites, toggleFavorite] = useFavoriteSlugs();
  const [recents] = useRecentVisits();
  const totalCount = new Set([...favorites, ...recents.map((item) => item.slug)]).size;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-300 motion-fn hover:text-white sm:inline-flex"
        aria-label="Open My Toolbox"
      >
        <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
        My Toolbox
        {totalCount > 0 && <span className="font-mono text-[10px] text-indigo-300">{totalCount}</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/80 px-4 pt-[15vh]"
          role="dialog"
          aria-modal="true"
          aria-label="My Toolbox"
        >
          <button className="absolute inset-0 cursor-default" onClick={() => setOpen(false)} aria-label="Close My Toolbox" />
          <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/12 bg-navy-900 motion-fn">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-indigo-300" aria-hidden="true" />
                <h2 className="font-bold text-white">My Toolbox</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-ink-400 hover:bg-white/10 hover:text-white"
                aria-label="Close My Toolbox"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {favorites.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 px-3 py-2">
                    <Heart className="h-4 w-4 text-cyan-400" />
                    <span className="meta text-ink-500">Favorites</span>
                  </div>
                  {favorites.map((slug) => {
                    const tool = getToolBySlug(slug);
                    const label = toolLabel(slug);
                    if (!tool || !label) return null;
                    return (
                      <div key={slug} className="flex items-center gap-1">
                        <Link
                          href={tool.href}
                          onClick={() => setOpen(false)}
                          className="flex-1 rounded-lg px-3 py-2 hover:bg-indigo-500/10"
                        >
                          <span className="block font-semibold text-white">{label}</span>
                          <span className="mt-0.5 block text-xs text-ink-500">{tool.summary}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(slug)}
                          className="rounded-md p-1.5 text-cyan-400 hover:bg-white/10"
                          aria-label={`Remove ${label} from favorites`}
                        >
                          <Heart className="h-4 w-4 fill-cyan-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {recents.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 px-3 py-2">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    <span className="meta text-ink-500">Recently used</span>
                  </div>
                  {recents.map((visit) => {
                    const tool = getToolBySlug(visit.slug);
                    const label = toolLabel(visit.slug);
                    if (!tool || !label) return null;
                    return (
                      <Link
                        key={visit.slug}
                        href={tool.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-indigo-500/10"
                      >
                        <span>
                          <span className="block font-semibold text-white">{label}</span>
                          <span className="mt-0.5 block font-mono text-[11px] text-ink-500">
                            {visit.visitedAt ? formatRelativeTime(visit.visitedAt) : tool.summary}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {favorites.length === 0 && recents.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-ink-400">Your Toolbox is empty.</p>
                  <p className="mt-2 text-xs text-ink-500">Use a tool. It stays on this device — no account.</p>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-4 py-2">
              <Link href="/tools" onClick={() => setOpen(false)} className="text-xs text-indigo-300 hover:text-white">
                Browse all {TOOLS.length} tools →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
