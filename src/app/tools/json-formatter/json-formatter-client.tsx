"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Minimize2, Trash2, Wand2 } from "lucide-react";
import { usePersistentState } from "@/lib/storage/preferences";

type FormatterPreferences = {
  indent: 2 | 4;
  sortKeys: boolean;
};

const DEFAULTS: FormatterPreferences = { indent: 2, sortKeys: false };

/** Recursively sorts object keys so diffs between two documents stay readable. */
function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, sortValue(nested)])
    );
  }
  return value;
}

export default function JsonFormatterClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [preferences, updatePreferences] = usePersistentState<FormatterPreferences>(
    "json-formatter",
    DEFAULTS
  );

  const parse = useCallback((): unknown => {
    if (!input.trim()) throw new Error("Paste some JSON to get started.");
    return JSON.parse(input);
  }, [input]);

  const run = useCallback(
    (transform: (parsed: unknown) => string) => {
      setCopied(false);
      try {
        const parsed = parse();
        setOutput(transform(preferences.sortKeys ? sortValue(parsed) : parsed));
        setError("");
      } catch (caught: unknown) {
        // JSON.parse messages include the character offset, which is the most
        // useful thing to show, so they are surfaced rather than replaced.
        setError(caught instanceof Error ? caught.message : "That is not valid JSON.");
        setOutput("");
      }
    },
    [parse, preferences.sortKeys]
  );

  const format = useCallback(
    () => run((parsed) => JSON.stringify(parsed, null, preferences.indent)),
    [run, preferences.indent]
  );
  const minify = useCallback(() => run((parsed) => JSON.stringify(parsed)), [run]);

  const copy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  }, []);

  const stats = useMemo(() => {
    if (!output) return null;
    const saved = input.length - output.length;
    return {
      characters: output.length.toLocaleString(),
      delta: saved > 0 ? `${saved.toLocaleString()} characters smaller` : null,
    };
  }, [input.length, output]);

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center gap-2 rounded-xl border border-white/5 bg-white/[0.025] p-3">
        <button
          type="button"
          onClick={format}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-400"
        >
          <Wand2 className="h-4 w-4" aria-hidden="true" /> Format
        </button>
        <button
          type="button"
          onClick={minify}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-ink-50 transition-colors hover:bg-white/10"
        >
          <Minimize2 className="h-4 w-4" aria-hidden="true" /> Minify
        </button>

        <label className="ml-auto flex items-center gap-2 text-xs text-ink-200">
          Indent
          <select
            value={preferences.indent}
            onChange={(event) => updatePreferences({ indent: Number(event.target.value) as 2 | 4 })}
            className="rounded-lg border border-white/10 bg-navy-900 px-2 py-1.5 text-sm text-white outline-none focus:border-indigo-400/50"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-200">
          <input
            type="checkbox"
            checked={preferences.sortKeys}
            onChange={(event) => updatePreferences({ sortKeys: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
          />
          Sort keys
        </label>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink-200">Input</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            placeholder={'{"hello":"world"}'}
            className="h-80 w-full resize-y rounded-xl border border-white/10 bg-navy-900 p-4 font-mono text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/15"
          />
        </label>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-200">Output</span>
            {output && (
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            spellCheck={false}
            placeholder="Formatted JSON appears here."
            className="h-80 w-full resize-y rounded-xl border border-white/10 bg-navy-950 p-4 font-mono text-sm text-ink-50 outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {stats && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-200">
          <span>{stats.characters} characters</span>
          {stats.delta && <span className="text-indigo-300">{stats.delta}</span>}
          <button
            type="button"
            onClick={clear}
            className="ml-auto inline-flex items-center gap-1.5 font-semibold text-ink-200 hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      )}
    </div>
  );
}
