"use client";

import { useCallback } from "react";
import TextTransform from "@/components/tools/text-transform";
import { usePersistentState } from "@/lib/storage/preferences";
import { decodeHtml, encodeHtml } from "@/lib/tools/html-entities";

type EntitiesPreferences = {
  mode: "encode" | "decode";
  level: "special" | "all";
  useNamedReferences: boolean;
  attributeContext: boolean;
};

const DEFAULTS: EntitiesPreferences = {
  mode: "encode",
  level: "special",
  useNamedReferences: false,
  attributeContext: false,
};

export default function HtmlEntitiesClient() {
  const [prefs, setPrefs] = usePersistentState<EntitiesPreferences>("convertlab:html-entities", DEFAULTS);

  const transform = useCallback(
    (input: string) => (prefs.mode === "encode"
      ? encodeHtml(input, { level: prefs.level, useNamedReferences: prefs.useNamedReferences })
      : decodeHtml(input, prefs.attributeContext)),
    [prefs],
  );

  const field = "field py-1.5 text-xs";

  return (
    <TextTransform
      inputLabel={prefs.mode === "encode" ? "Text" : "Entities"}
      outputLabel={prefs.mode === "encode" ? "Encoded" : "Decoded"}
      live
      placeholder={prefs.mode === "encode" ? "Tom & Jerry's <café>" : "Tom &amp; Jerry&#39;s"}
      transform={transform}
      options={
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-200">
            Mode
            <select
              value={prefs.mode}
              onChange={(event) => setPrefs({ mode: event.target.value as "encode" | "decode" })}
              className={field}
            >
              <option value="encode">Encode</option>
              <option value="decode">Decode</option>
            </select>
          </label>
          {prefs.mode === "encode" ? (
            <>
              <label className="flex items-center gap-2 text-xs text-ink-200">
                Scope
                <select
                  value={prefs.level}
                  onChange={(event) => setPrefs({ level: event.target.value as "special" | "all" })}
                  className={field}
                >
                  <option value="special">Special characters only</option>
                  <option value="all">Every character</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs text-ink-200">
                <input
                  type="checkbox"
                  checked={prefs.useNamedReferences}
                  onChange={(event) => setPrefs({ useNamedReferences: event.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
                />
                Named references
              </label>
            </>
          ) : (
            <label className="flex items-center gap-2 text-xs text-ink-200">
              <input
                type="checkbox"
                checked={prefs.attributeContext}
                onChange={(event) => setPrefs({ attributeContext: event.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
              />
              Inside an attribute value
            </label>
          )}
        </div>
      }
    />
  );
}
