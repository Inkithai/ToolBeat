"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { CASE_STYLES, convertCase, type CaseStyle } from "@/lib/tools/text-case";
import { usePersistentState } from "@/lib/storage/preferences";

type CasePreferences = { style: CaseStyle };

const DEFAULTS: CasePreferences = { style: "title" };

export default function TextCaseClient() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [preferences, updatePreferences] = usePersistentState<CasePreferences>("text-case", DEFAULTS);

  const output = useMemo(
    () => (input ? convertCase(input, preferences.style) : ""),
    [input, preferences.style],
  );

  const copy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-white/5 bg-white/[0.025] p-3" aria-label="Case style">
        <div className="flex flex-wrap gap-1.5">
          {CASE_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => updatePreferences({ style: style.id })}
              aria-pressed={preferences.style === style.id}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                preferences.style === style.id
                  ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300"
                  : "border-white/10 bg-transparent text-slate-400 hover:border-white/20 hover:text-ink-200"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink-200">Input</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste or type text — try “user profile PAGE-v2” and watch every style."
            className="h-64 w-full resize-y rounded-xl border border-white/10 bg-navy-900 p-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/15"
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
            placeholder="Converted text appears here."
            className="h-64 w-full resize-y rounded-xl border border-white/10 bg-navy-950 p-4 text-sm text-ink-50 outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-200">
        <p>
          Programming styles rebuild words from punctuation <em>and</em> camelCase boundaries —{" "}
          <code className="rounded bg-white/5 px-1 py-0.5">loadPDFReport-v2</code> becomes{" "}
          <code className="rounded bg-white/5 px-1 py-0.5">load_pdf_report_v2</code>.
        </p>
        {input && (
          <button
            type="button"
            onClick={() => setInput("")}
            className="ml-auto inline-flex items-center gap-1.5 font-semibold text-ink-200 hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
