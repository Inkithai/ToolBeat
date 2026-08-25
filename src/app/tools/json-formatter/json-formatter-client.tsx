"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Minimize2, Trash2, Wand2 } from "lucide-react";
import { usePersistentState } from "@/lib/storage/preferences";
import IoWorkspace from "@/components/tools/io-workspace";

type FormatterPreferences = {
  indent: 2 | 4;
  sortKeys: boolean;
};

const DEFAULTS: FormatterPreferences = { indent: 2, sortKeys: false };

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, sortValue(nested)]),
    );
  }
  return value;
}

export default function JsonFormatterClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [preferences, updatePreferences] = usePersistentState<FormatterPreferences>("json-formatter", DEFAULTS);

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
        setError(caught instanceof Error ? caught.message : "That is not valid JSON.");
        setOutput("");
      }
    },
    [parse, preferences.sortKeys],
  );

  const format = useCallback(
    () => run((parsed) => JSON.stringify(parsed, null, preferences.indent)),
    [run, preferences.indent],
  );
  const minify = useCallback(() => run((parsed) => JSON.stringify(parsed)), [run]);

  const copy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const stats = useMemo(() => {
    if (!output) return null;
    const saved = input.length - output.length;
    return {
      characters: output.length.toLocaleString(),
      delta: saved > 0 ? `${saved.toLocaleString()} characters smaller` : null,
    };
  }, [input.length, output]);

  return (
    <IoWorkspace
      status={error ? "error" : output ? "complete" : "idle"}
      input={
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          placeholder={'{"hello":"world"}'}
          className="field h-80 resize-y font-mono text-sm"
        />
      }
      output={
        <textarea
          value={output}
          readOnly
          spellCheck={false}
          placeholder="Formatted JSON appears here."
          className="field h-80 resize-y font-mono text-sm"
        />
      }
      outputAction={
        output ? (
          <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 motion-fn hover:text-indigo-300">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null
      }
      process={
        <>
          <button type="button" onClick={format} className="btn-primary">
            <Wand2 className="h-4 w-4" aria-hidden="true" /> Format
          </button>
          <button type="button" onClick={minify} className="btn-secondary">
            <Minimize2 className="h-4 w-4" aria-hidden="true" /> Minify
          </button>
          <label className="ml-auto flex items-center gap-2 text-xs text-ink-200">
            Indent
            <select
              value={preferences.indent}
              onChange={(event) => updatePreferences({ indent: Number(event.target.value) as 2 | 4 })}
              className="rounded-lg border border-white/10 bg-navy-900 px-2 py-1.5 text-sm text-white outline-none"
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
              className="h-4 w-4 accent-indigo-500"
            />
            Sort keys
          </label>
        </>
      }
      footer={
        <>
          {error && (
            <p role="alert" className="mt-4 text-sm text-rose-300">
              {error}
            </p>
          )}
          {stats && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-200">
              <span>{stats.characters} characters</span>
              {stats.delta && <span className="text-indigo-300">{stats.delta}</span>}
              <button type="button" onClick={() => { setInput(""); setOutput(""); setError(""); setCopied(false); }} className="ml-auto inline-flex items-center gap-1.5 font-semibold hover:text-white">
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          )}
        </>
      }
    />
  );
}
