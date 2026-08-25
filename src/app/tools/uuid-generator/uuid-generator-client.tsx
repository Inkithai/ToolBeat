"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Dices, Trash2 } from "lucide-react";
import { generateUuidV4List } from "@/lib/tools/uuid";
import { usePersistentState } from "@/lib/storage/preferences";

type GeneratorPreferences = {
  count: number;
  uppercase: boolean;
  hyphens: boolean;
};

const DEFAULTS: GeneratorPreferences = { count: 5, uppercase: false, hyphens: true };
const MIN_COUNT = 1;
const MAX_COUNT = 100;

export default function UuidGeneratorClient() {
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [preferences, updatePreferences] = usePersistentState<GeneratorPreferences>(
    "uuid-generator",
    DEFAULTS,
  );

  const count = Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.round(preferences.count) || MIN_COUNT));

  const generate = useCallback(() => {
    setCopied(false);
    setOutput(
      generateUuidV4List(count, {
        uppercase: preferences.uppercase,
        hyphens: preferences.hyphens,
      }).join("\n"),
    );
  }, [count, preferences.hyphens, preferences.uppercase]);

  const copy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3">
        <label className="flex items-center gap-2 text-xs text-ink-200">
          How many
          <input
            type="number"
            min={MIN_COUNT}
            max={MAX_COUNT}
            value={preferences.count}
            onChange={(event) => updatePreferences({ count: Number(event.target.value) })}
            className="w-20 rounded-lg border border-white/10 bg-navy-900 px-2 py-1.5 text-sm text-white outline-none focus:border-cyan-400/50"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-200">
          <input
            type="checkbox"
            checked={preferences.hyphens}
            onChange={(event) => updatePreferences({ hyphens: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-cyan-500"
          />
          Hyphens
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-200">
          <input
            type="checkbox"
            checked={preferences.uppercase}
            onChange={(event) => updatePreferences({ uppercase: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-cyan-500"
          />
          Uppercase
        </label>
        <button
          type="button"
          onClick={generate}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-cyan-400"
        >
          <Dices className="h-4 w-4" aria-hidden="true" /> Generate
        </button>
      </section>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-200">UUIDs (v4)</span>
          {output && (
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy all"}
            </button>
          )}
        </div>
        <textarea
          value={output}
          readOnly
          spellCheck={false}
          placeholder="Press Generate — UUIDs come from your browser's crypto API and never leave this page."
          className="h-72 w-full resize-y rounded-xl border border-white/10 bg-navy-950 p-4 font-mono text-sm text-ink-50 outline-none placeholder:text-slate-600"
        />
      </div>

      <div className="flex items-center gap-3 text-xs text-ink-200">
        <p>Randomness comes from <code className="rounded bg-white/5 px-1 py-0.5">crypto.getRandomValues</code> — RFC 4122 version 4.</p>
        {output && (
          <button
            type="button"
            onClick={() => setOutput("")}
            className="ml-auto inline-flex items-center gap-1.5 font-semibold text-ink-200 hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
