"use client";

import { useCallback, useEffect, useState } from "react";
import { readPreference, writePreference } from "./preferences";

/**
 * Tool activity: favorites and recently used tools.
 *
 * Same rules as the rest of preference storage: `localStorage` under the
 * `toolbeat:` namespace, preferences only, never tool input. What is stored
 * here is a list of tool slugs — nothing a user typed or converted.
 */

const FAVORITES_KEY = "tool-favorites";
const RECENTS_KEY = "tool-recents";
const LEGACY_TOOLBOX_KEY = "toolbeat_toolbox_v1";

/** How many recent tools to remember and show. */
export const RECENT_TOOL_LIMIT = 8;

type SlugsRecord = { slugs: unknown; visitedAt?: unknown };

export type RecentVisit = {
  slug: string;
  visitedAt?: number;
};

function asSlugList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((slug): slug is string => typeof slug === "string");
}

function asVisitedAt(value: unknown): Record<string, number> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const next: Record<string, number> = {};
  for (const [slug, stamp] of Object.entries(value as Record<string, unknown>)) {
    if (typeof stamp === "number" && Number.isFinite(stamp)) next[slug] = stamp;
  }
  return next;
}

function readSlugs(key: string): string[] {
  migrateLegacyToolbox();
  const record = readPreference<SlugsRecord>(key, { slugs: [] });
  return asSlugList(record.slugs);
}

function readVisitedAt(): Record<string, number> {
  migrateLegacyToolbox();
  const record = readPreference<SlugsRecord>(RECENTS_KEY, { slugs: [] });
  return asVisitedAt(record.visitedAt);
}

/**
 * One-time lift from the old header-only toolbox key so recents/favorites
 * agree across the homepage, directory and My Toolbox. Still localStorage only.
 */
function migrateLegacyToolbox(): void {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(LEGACY_TOOLBOX_KEY);
  if (!raw) return;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(LEGACY_TOOLBOX_KEY);
      return;
    }

    const favoriteSlugs = new Set(asSlugList(readPreference<SlugsRecord>(FAVORITES_KEY, { slugs: [] }).slugs));
    const recents = readPreference<SlugsRecord>(RECENTS_KEY, { slugs: [] });
    const recentSlugs = asSlugList(recents.slugs);
    const visitedAt = asVisitedAt(recents.visitedAt);

    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const record = item as { slug?: unknown; type?: unknown; lastUsedAt?: unknown; addedAt?: unknown };
      if (typeof record.slug !== "string") continue;
      const stamp =
        typeof record.lastUsedAt === "number"
          ? record.lastUsedAt
          : typeof record.addedAt === "number"
            ? record.addedAt
            : Date.now();
      if (record.type === "favorite") favoriteSlugs.add(record.slug);
      if (!recentSlugs.includes(record.slug)) recentSlugs.push(record.slug);
      if (!visitedAt[record.slug]) visitedAt[record.slug] = stamp;
    }

    writePreference(FAVORITES_KEY, { slugs: Array.from(favoriteSlugs) });
    writePreference(RECENTS_KEY, {
      slugs: recentSlugs.slice(0, RECENT_TOOL_LIMIT),
      visitedAt,
    });
  } catch {
    // Corrupted legacy payload — drop it so it cannot loop.
  }

  window.localStorage.removeItem(LEGACY_TOOLBOX_KEY);
}

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

export function readRecentVisits(): RecentVisit[] {
  const visitedAt = readVisitedAt();
  return readRecentSlugs().map((slug) => ({ slug, visitedAt: visitedAt[slug] }));
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
 * `RECENT_TOOL_LIMIT`. Called from a mount effect, so it must be idempotent
 * for the slug list; the timestamp still updates.
 */
export function recordToolVisit(slug: string, visitedAt = Date.now()): void {
  const next = [slug, ...readRecentSlugs().filter((existing) => existing !== slug)].slice(
    0,
    RECENT_TOOL_LIMIT,
  );
  const stamps = { ...readVisitedAt(), [slug]: visitedAt };
  writePreference(RECENTS_KEY, { slugs: next, visitedAt: stamps });
  emitActivityChange();
}

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

export function useRecentVisits(): [RecentVisit[], boolean] {
  const [visits, setVisits] = useState<RecentVisit[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setVisits(readRecentVisits());
    sync();
    setHydrated(true);
    window.addEventListener(ACTIVITY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ACTIVITY_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return [visits, hydrated];
}
