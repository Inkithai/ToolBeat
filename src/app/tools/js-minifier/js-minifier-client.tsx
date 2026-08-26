"use client";

import { useCallback, useState } from "react";
import TextTransform from "@/components/tools/text-transform";
import { usePersistentState } from "@/lib/storage/preferences";
import { minifyJs, type JsMinifyOptions } from "@/lib/tools/minify-js";
import { formatBytes } from "@/lib/tools/image-ops";

type MinifierPreferences = Pick<JsMinifyOptions, "dropConsole" | "target">;

const DEFAULTS: MinifierPreferences = { dropConsole: false, target: "es6" };

export default function JsMinifierClient() {
  const [prefs, setPrefs] = usePersistentState<MinifierPreferences>("convertlab:js-minifier", DEFAULTS);
  const [stats, setStats] = useState<{ before: number; after: number; pct: number } | null>(null);

  const transform = useCallback(
    async (input: string) => {
      const result = await minifyJs(input, prefs);
      setStats({ before: result.inputBytes, after: result.outputBytes, pct: result.reducedPct });
      return result.code;
    },
    [prefs],
  );

  const field = "field py-1.5 text-xs";

  return (
    <TextTransform
      inputLabel="JavaScript"
      outputLabel="Minified"
      live={false}
      outputKind="code"
      placeholder="Paste JavaScript to minify…"
      transform={transform}
      options={
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-200">
            <input
              type="checkbox"
              checked={prefs.dropConsole}
              onChange={(event) => setPrefs({ ...prefs, dropConsole: event.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
            />
            Remove console.*()
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-200">
            Target
            <select
              value={prefs.target}
              onChange={(event) => setPrefs({ ...prefs, target: event.target.value as "es5" | "es6" })}
              className={field}
            >
              <option value="es6">Modern (ES2017+)</option>
              <option value="es5">ES5</option>
            </select>
          </label>
          {stats && (
            <span className="ml-auto rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
              {formatBytes(stats.before)} → {formatBytes(stats.after)} (−{stats.pct.toFixed(1)}%)
            </span>
          )}
        </div>
      }
    />
  );
}
