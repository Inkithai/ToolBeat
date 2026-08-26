"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { usePersistentState } from "@/lib/storage/preferences";
import { buildUtm, extractUtm, UTM_KEYS } from "@/lib/tools/url-tools";

type UtmPreferences = {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
};

const DEFAULTS: UtmPreferences = {
  baseUrl: "https://convertlab.example/landing",
  source: "newsletter",
  medium: "email",
  campaign: "launch",
  term: "",
  content: "",
};

export default function UtmBuilderClient() {
  const [tab, setTab] = useState<"build" | "parse">("build");
  const [prefs, setPrefs] = usePersistentState<UtmPreferences>("convertlab:utm-builder", DEFAULTS);
  const [parseInput, setParseInput] = useState("https://example.com/?utm_source=news&utm_medium=email");
  const [copied, setCopied] = useState(false);

  const built = useMemo(
    () =>
      buildUtm(prefs.baseUrl, {
        source: prefs.source,
        medium: prefs.medium,
        campaign: prefs.campaign,
        term: prefs.term,
        content: prefs.content,
      }),
    [prefs],
  );

  const extracted = useMemo(() => extractUtm(parseInput), [parseInput]);

  const copy = async () => {
    if (!built.href) return;
    await navigator.clipboard.writeText(built.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const field = "w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/50";
  const label = "mb-1.5 block text-xs font-medium text-ink-400";

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
        {(["build", "parse"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === value ? "bg-indigo-500/20 text-white" : "text-ink-400 hover:text-white"
            }`}
          >
            {value === "build" ? "Build a tagged URL" : "Parse an existing URL"}
          </button>
        ))}
      </div>

      {tab === "build" ? (
        <div className="space-y-4">
          <label className="block">
            <span className={label}>Base URL</span>
            <input
              type="text"
              value={prefs.baseUrl}
              onChange={(event) => setPrefs({ baseUrl: event.target.value })}
              placeholder="https://example.com/page"
              className={`${field} font-mono`}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {UTM_KEYS.map(({ key, label: fieldLabel, field }) => (
              <label key={key} className="block">
                <span className={label}>
                  {fieldLabel} <span className="text-ink-600">({key})</span>
                </span>
                <input
                  type="text"
                  value={prefs[field]}
                  onChange={(event) => setPrefs({ [field]: event.target.value })}
                  placeholder={key}
                  className={`${field} font-mono`}
                />
              </label>
            ))}
          </div>

          {!built.valid ? (
            <p className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              {built.error}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="meta text-ink-500">Tagged URL</p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 break-all rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 font-mono text-sm text-indigo-200">
                  {built.href}
                </code>
                <button
                  type="button"
                  onClick={() => void copy()}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              {built.replaced.length > 0 && (
                <p className="text-xs text-ink-600">
                  Replaced existing parameter{built.replaced.length === 1 ? "" : "s"}: {built.replaced.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={parseInput}
            onChange={(event) => setParseInput(event.target.value)}
            placeholder="Paste a URL to inspect its UTM tags…"
            className={`${field} font-mono`}
          />
          {!extracted.valid ? (
            <p className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              {extracted.error}
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-white/[0.06]">
              {extracted.params.map((param, index) => (
                <div
                  key={param.key}
                  className={`flex items-center gap-3 px-3 py-2 ${index % 2 === 1 ? "bg-white/[0.02]" : ""}`}
                >
                  <span className="w-28 shrink-0 font-mono text-xs text-indigo-300">{param.key}</span>
                  {param.present ? (
                    <span className="break-all font-mono text-xs text-white">{param.value}</span>
                  ) : (
                    <span className="text-xs text-ink-600">not set</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
