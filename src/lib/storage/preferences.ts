"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Preference storage.
 *
 * Deliberately `localStorage` and nothing more. The only thing any tool needs
 * to remember is a handful of small, non-sensitive settings — indent width,
 * timer lengths. IndexedDB would buy asynchronous access and large-value
 * support that no tool here requires.
 *
 * What is stored is constrained on purpose: preferences only, never tool input.
 * Converted files, pasted JSON and typed text stay in memory and disappear on
 * reload, which is what the capability model advertises.
 */

const NAMESPACE = "convertlab";

function storageKey(key: string): string {
  return `${NAMESPACE}:${key}`;
}

/**
 * Reads a stored value, merging it over `fallback` so a partial or outdated
 * stored object cannot leave a tool with missing fields.
 */
export function readPreference<T extends object>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return fallback;
    return { ...fallback, ...(parsed as Partial<T>) };
  } catch {
    // Storage can throw in private mode or when the quota is exceeded. A
    // preference is never important enough to break the tool over.
    return fallback;
  }
}

export function writePreference<T extends object>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    // Ignored for the same reason as above.
  }
}

export function clearPreference(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(key));
  } catch {
    // Ignored.
  }
}

/**
 * State that survives reloads.
 *
 * Initial state is the fallback on both server and first client render, and the
 * stored value is applied in an effect. Reading storage during render would
 * produce server/client HTML mismatches; this trades one extra render for
 * correct hydration.
 */
export function usePersistentState<T extends object>(
  key: string,
  fallback: T
): [T, (update: Partial<T>) => void, () => void] {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readPreference(key, fallback));
    setHydrated(true);
    // `fallback` is intentionally omitted: callers commonly pass an object
    // literal, which would re-run this effect on every render and clobber
    // user edits. The key alone identifies the stored record.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (partial: Partial<T>) => {
      setValue((current) => {
        const next = { ...current, ...partial };
        // Only persist after hydration, so the fallback cannot overwrite a
        // stored value during the first render pass.
        if (hydrated) writePreference(key, next);
        return next;
      });
    },
    [hydrated, key]
  );

  const reset = useCallback(() => {
    clearPreference(key);
    setValue(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, update, reset];
}
