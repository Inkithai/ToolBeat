"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Dices, Trash2 } from "lucide-react";
import { generateUuidV4List } from "@/lib/tools/uuid";
import { usePersistentState } from "@/lib/storage/preferences";
import IoWorkspace from "@/components/tools/io-workspace";

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
    <IoWorkspace
      inputLabel="Generate"
      outputLabel="UUIDs (v4)"
      status={output ? "complete" : "idle"}
      input={
        <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-ink-200">
          How many
          <input
            type="number"
            min={MIN_COUNT}
            max={MAX_COUNT}
            value={preferences.count}
            onChange={(event) => updatePreferences({ count: Number(event.target.value) })}
            className="w-20 rounded-lg border border-white/10 bg-navy-900 px-2 py-1.5 text-sm text-white outline-none focus:border-indigo-400/50"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-200">
          <input
            type="checkbox"
            checked={preferences.hyphens}
            onChange={(event) => updatePreferences({ hyphens: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
          />
          Hyphens
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-200">
          <input
            type="checkbox"
            checked={preferences.uppercase}
            onChange={(event) => updatePreferences({ uppercase: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
          />
          Uppercase
        </label>
        <button
          type="button"
          onClick={generate}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-400"
        >
          <Dices className="h-4 w-4" aria-hidden="true" /> Generate
        </button>
        </div>
      }
      output={
        <textarea
          value={output}
          readOnly
          spellCheck={false}
          placeholder="Press Generate — UUIDs come from your browser's crypto API and never leave this page."
          className="field h-72 resize-y font-mono text-sm"
        />
      }
      outputAction={
        output ? (
          <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 motion-fn hover:text-indigo-300">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy all"}
          </button>
        ) : null
      }
      footer={
        <div className="mt-4 flex items-center gap-3 text-xs text-ink-200">
          <p>Randomness comes from <code className="rounded bg-white/5 px-1 py-0.5">crypto.getRandomValues</code> — RFC 4122 version 4.</p>
          {output && (
            <button type="button" onClick={() => setOutput("")} className="ml-auto inline-flex items-center gap-1.5 font-semibold hover:text-white">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      }
    />
  );
}
