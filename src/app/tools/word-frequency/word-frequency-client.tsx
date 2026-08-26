"use client";

import { useMemo, useState } from "react";
import { wordFrequency } from "@/lib/tools/word-frequency";

export default function WordFrequencyClient() {
  const [text, setText] = useState("");
  const [topN, setTopN] = useState(20);
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [minLength, setMinLength] = useState(2);

  const result = useMemo(
    () => wordFrequency(text, { caseInsensitive, minLength, topN }),
    [text, caseInsensitive, minLength, topN],
  );

  const maxCount = result.entries[0]?.count ?? 1;
  const field = "rounded-lg border border-white/10 bg-navy-900 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-400/50";

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={8}
        placeholder="Paste any text to rank its most common words…"
        className="field w-full resize-y text-sm"
      />

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-ink-200">
          Top
          <input
            type="number"
            min={1}
            max={100}
            value={topN}
            onChange={(event) => setTopN(Number(event.target.value) || 1)}
            className={`${field} w-20`}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-200">
          Min length
          <input
            type="number"
            min={1}
            max={20}
            value={minLength}
            onChange={(event) => setMinLength(Math.max(1, Number(event.target.value) || 1))}
            className={`${field} w-20`}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-200">
          <input
            type="checkbox"
            checked={caseInsensitive}
            onChange={(event) => setCaseInsensitive(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
          />
          Case-insensitive
        </label>
        {text.trim() && (
          <span className="ml-auto text-xs text-ink-500">
            {result.total.toLocaleString()} words · {result.unique.toLocaleString()} unique
          </span>
        )}
      </div>

      {result.entries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3 py-6 text-center text-sm text-ink-600">
          The word ranking appears here.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-white/[0.06]">
          {result.entries.map((entry, index) => (
            <div key={entry.word} className={`flex items-center gap-3 px-3 py-2 ${index % 2 === 1 ? "bg-white/[0.02]" : ""}`}>
              <span className="w-8 shrink-0 text-right font-mono text-xs text-ink-600">{index + 1}</span>
              <span className="w-40 shrink-0 truncate font-mono text-sm text-white" title={entry.word}>
                {entry.word}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                <div className="h-full rounded-full bg-indigo-500/70" style={{ width: `${(entry.count / maxCount) * 100}%` }} />
              </div>
              <span className="w-12 shrink-0 text-right font-mono text-xs text-ink-300">{entry.count}</span>
              <span className="w-14 shrink-0 text-right font-mono text-xs text-ink-600">{entry.pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
