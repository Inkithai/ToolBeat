"use client";

import { useCallback, useMemo, useState } from "react";
import TextTransform from "@/components/tools/text-transform";
import { usePersistentState } from "@/lib/storage/preferences";
import { escapeUnicode, inspectUnicode, unescapeUnicode } from "@/lib/tools/unicode-escapes";

type UnicodePreferences = { direction: "escape" | "unescape" };

const DEFAULTS: UnicodePreferences = { direction: "escape" };

export default function UnicodeEscapesClient() {
  const [prefs, setPrefs] = usePersistentState<UnicodePreferences>("convertlab:unicode-escapes", DEFAULTS);
  const [source, setSource] = useState("");

  const transform = useCallback(
    (input: string) => (prefs.direction === "escape" ? escapeUnicode(input) : unescapeUnicode(input)),
    [prefs],
  );

  const codePoints = useMemo(() => {
    if (!source.trim()) return [];
    return inspectUnicode(source).slice(0, 12);
  }, [source]);

  return (
    <TextTransform
      inputLabel="Text"
      outputLabel={prefs.direction === "escape" ? "Escaped" : "Unescaped"}
      live
      outputKind="code"
      placeholder={prefs.direction === "escape" ? "café ✓ 😀" : "caf\\u00E9 \\u2713"}
      transform={transform}
      onInputChange={setSource}
      options={
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-200">
            Direction
            <select
              value={prefs.direction}
              onChange={(event) => setPrefs({ direction: event.target.value as "escape" | "unescape" })}
              className="field py-1.5 text-xs"
            >
              <option value="escape">Text → \u escapes</option>
              <option value="unescape">\u escapes → text</option>
            </select>
          </label>
          {codePoints.length > 0 && (
            <span className="ml-auto flex flex-wrap gap-1">
              {codePoints.map((entry) => (
                <code
                  key={entry.codePoint}
                  title={`${entry.char} — ${entry.codePoint}, ${entry.utf8Bytes} UTF-8 byte${entry.utf8Bytes === 1 ? "" : "s"}`}
                  className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-ink-300"
                >
                  {entry.codePoint}
                </code>
              ))}
              {inspectUnicode(source).length > 12 && (
                <code className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-ink-500">
                  +{inspectUnicode(source).length - 12}
                </code>
              )}
            </span>
          )}
        </div>
      }
    />
  );
}
