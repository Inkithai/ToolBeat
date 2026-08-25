"use client";

import { useCallback, useEffect, useState } from "react";
import { readPreference, writePreference } from "./preferences";

/**
 * Tool activity: favorites and recently used tools.
 *
 * Same rules as the rest of preference storage: `localStorage` under the
 * `convertlab:` namespace, preferences only, never tool input. What is stored
 * here is a list of tool slugs — nothing a user typed or converted.
 *
 * These records are platform-level, not per-tool: a tool whose capabilities
 * declare `persistence: "none"` still stores nothing of its own; the star a
 * user clicks lives in the directory, like a browser bookmark.
 */

const FAVORITES_KEY = "tool-favorites";
const RECENTS_KEY = "tool-recents";

/** How many recent tools to remember and show. */
export const RECENT_TOOL_LIMIT = 8;

/**
 * Written records are `{ slugs: [...] }` objects so `readPreference`'s
 * merge-over-fallback behaviour applies; the array is validated on the way
 * out so a corrupted or hand-edited record degrades to "empty", never crash.
 */
type SlugsRecord = { slugs: unknown };

function readSlugs(key: string): string[] {
  const record = readPreference<SlugsRecord>(key, { slugs: [] });
  if (!Array.isArray(record.slugs)) return [];
  return record.slugs.filter((slug): slug is string => typeof slug === "string");
}

/**
 * Notified on every write so mounted surfaces (a star button here, a recents
 * row there) re-read without sharing state through a parent. The `storage`
 * event covers other tabs.
 */
const ACTIVITY_EVENT = "convertlab:tool-activity";

function emitActivityChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ACTIVITY_EVENT));
}

export function readFavoriteSlugs(): string[] {
  return readSlugs(FAVORITES_KEY);
}

export function readRecentSlugs(): string[] {
  return readSlugs(RECENTS_KEY);
}

export function toggleFavorite(slug: string): void {
  const current = readFavoriteSlugs();
  const next = current.includes(slug)
    ? current.filter((existing) => existing !== slug)
    : [...current, slug];
  writePreference(FAVORITES_KEY, { slugs: next });
  emitActivityChange();
}

/**
 * Moves a slug to the front of the recents list, deduplicating and capping at
 * `RECENT_TOOL_LIMIT`. Called from a mount effect, so it must be idempotent.
 */
export function recordToolVisit(slug: string): void {
  const next = [slug, ...readRecentSlugs().filter((existing) => existing !== slug)].slice(
    0,
    RECENT_TOOL_LIMIT,
  );
  writePreference(RECENTS_KEY, { slugs: next });
  emitActivityChange();
}

/**
 * Shared subscription behaviour: start from the empty fallback so server HTML
 * and first client render match, then read storage and subscribe in an effect
 * (the same hydration trade-off `usePersistentState` makes).
 */
function useSlugs(key: string): [string[], boolean] {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setSlugs(readSlugs(key));
    sync();
    setHydrated(true);
    window.addEventListener(ACTIVITY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ACTIVITY_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);

  return [slugs, hydrated];
}

export function useFavoriteSlugs(): [string[], (slug: string) => void] {
  const [slugs] = useSlugs(FAVORITES_KEY);
  const toggle = useCallback((slug: string) => {
    toggleFavorite(slug);
  }, []);
  return [slugs, toggle];
}

export function useRecentSlugs(): [string[], boolean] {
  return useSlugs(RECENTS_KEY);
}
