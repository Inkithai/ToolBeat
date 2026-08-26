"use client";

import { useCallback } from "react";
import TextTransform from "@/components/tools/text-transform";
import { usePersistentState } from "@/lib/storage/preferences";
import { transformLines, type LineSortMode } from "@/lib/tools/line-tools";

type LinePreferences = {
  sort: LineSortMode;
  caseInsensitive: boolean;
  dedupe: boolean;
  removeBlank: boolean;
  trim: boolean;
};

const DEFAULTS: LinePreferences = {
  sort: "asc",
  caseInsensitive: true,
  dedupe: true,
  removeBlank: true,
  trim: true,
};

const SORT_MODES: { value: LineSortMode; label: string }[] = [
  { value: "none", label: "No sort" },
  { value: "asc", label: "A → Z" },
  { value: "desc", label: "Z → A" },
  { value: "natural-asc", label: "Natural (item2 < item10)" },
  { value: "natural-desc", label: "Natural, descending" },
];

export default function LineSorterClient() {
  const [prefs, setPrefs] = usePersistentState<LinePreferences>("convertlab:line-sorter", DEFAULTS);

  const transform = useCallback(
    (input: string) => transformLines(input, prefs).join("\n"),
    [prefs],
  );

  const checkbox = "h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500";

  return (
    <TextTransform
      inputLabel="Lines"
      outputLabel="Result"
      live
      placeholder={"banana\napple\nbanana\ncherry"}
      transform={transform}
      options={
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex items-center gap-2 text-xs text-ink-200">
            Sort
            <select
              value={prefs.sort}
              onChange={(event) => setPrefs({ sort: event.target.value as LineSortMode })}
              className="field py-1.5 text-xs"
            >
              {SORT_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-200">
            <input
              type="checkbox"
              checked={prefs.caseInsensitive}
              onChange={(event) => setPrefs({ caseInsensitive: event.target.checked })}
              className={checkbox}
            />
            Case-insensitive
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-200">
            <input
              type="checkbox"
              checked={prefs.dedupe}
              onChange={(event) => setPrefs({ dedupe: event.target.checked })}
              className={checkbox}
            />
            Remove duplicates
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-200">
            <input
              type="checkbox"
              checked={prefs.removeBlank}
              onChange={(event) => setPrefs({ removeBlank: event.target.checked })}
              className={checkbox}
            />
            Remove blank lines
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-200">
            <input
              type="checkbox"
              checked={prefs.trim}
              onChange={(event) => setPrefs({ trim: event.target.checked })}
              className={checkbox}
            />
            Trim each line
          </label>
        </div>
      }
    />
  );
}
