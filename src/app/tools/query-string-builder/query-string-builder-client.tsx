"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { usePersistentState } from "@/lib/storage/preferences";
import { buildQueryString, parseUrl } from "@/lib/tools/url-tools";

type Pair = { key: string; value: string };

type QueryPreferences = {
  pairs: Pair[];
  sort: boolean;
  skipEmpty: boolean;
  baseUrl: string;
};

const DEFAULTS: QueryPreferences = {
  pairs: [
    { key: "utm_source", value: "newsletter" },
    { key: "page", value: "" },
  ],
  sort: false,
  skipEmpty: true,
  baseUrl: "",
};

export default function QueryStringBuilderClient() {
  const [prefs, setPrefs] = usePersistentState<QueryPreferences>("convertlab:query-string", DEFAULTS);
  const [copied, setCopied] = useState(false);

  const query = useMemo(
    () => buildQueryString(prefs.pairs, { sort: prefs.sort, skipEmpty: prefs.skipEmpty }),
    [prefs.pairs, prefs.sort, prefs.skipEmpty],
  );

  const fullUrl = useMemo(() => {
    const base = prefs.baseUrl.trim();
    if (!base) return "";
    const parsed = parseUrl(base);
    if (!parsed.valid) return "";
    return `${base}${base.includes("?") ? "&" : "?"}${query}`;
  }, [prefs.baseUrl, query]);

  const updatePair = useCallback(
    (index: number, patch: Partial<Pair>) => {
      setPrefs({
        pairs: prefs.pairs.map((pair, i) => (i === index ? { ...pair, ...patch } : pair)),
      });
    },
    [prefs.pairs, setPrefs],
  );

  const copy = useCallback(async () => {
    if (!query) return;
    await navigator.clipboard.writeText(query);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [query]);

  const field = "w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-400/50";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {prefs.pairs.map((pair, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={pair.key}
              onChange={(event) => updatePair(index, { key: event.target.value })}
              placeholder="key"
              className={`${field} font-mono`}
            />
            <input
              type="text"
              value={pair.value}
              onChange={(event) => updatePair(index, { value: event.target.value })}
              placeholder="value"
              className={`${field} font-mono`}
            />
            <button
              type="button"
              onClick={() => setPrefs({ pairs: prefs.pairs.filter((_, i) => i !== index) })}
              className="shrink-0 rounded-lg border border-white/10 px-2 text-ink-500 transition-colors hover:border-rose-400/40 hover:text-rose-300"
              aria-label={`Remove ${pair.key || "pair"}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPrefs({ pairs: [...prefs.pairs, { key: "", value: "" }] })}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Add pair
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-ink-200">
          <input
            type="checkbox"
            checked={prefs.sort}
            onChange={(event) => setPrefs({ sort: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
          />
          Sort by key
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-200">
          <input
            type="checkbox"
            checked={prefs.skipEmpty}
            onChange={(event) => setPrefs({ skipEmpty: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
          />
          Skip empty values
        </label>
      </div>

      <div>
        <p className="meta mb-1.5 text-ink-500">Query string</p>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded-lg border border-white/10 bg-navy-900 px-3 py-2 font-mono text-sm text-emerald-300">
            {query || <span className="text-ink-600">Add pairs to build a query string</span>}
          </code>
          {query && (
            <button
              type="button"
              onClick={() => void copy()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="meta mb-1.5 text-ink-500">Optional: attach to a base URL</p>
        <input
          type="text"
          value={prefs.baseUrl}
          onChange={(event) => setPrefs({ baseUrl: event.target.value })}
          placeholder="https://example.com/page"
          className="field w-full font-mono text-sm"
        />
        {fullUrl && query && (
          <code className="mt-2 block break-all rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 font-mono text-sm text-indigo-200">
            {fullUrl}
          </code>
        )}
      </div>
    </div>
  );
}
