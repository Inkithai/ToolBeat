"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { analyzeText } from "@/lib/tools/word-count";

const FIELDS = [
  { key: "words", label: "Words" },
  { key: "characters", label: "Characters" },
  { key: "charactersNoSpaces", label: "No spaces" },
  { key: "sentences", label: "Sentences" },
  { key: "paragraphs", label: "Paragraphs" },
] as const;

export default function WordCounterClient() {
  const [text, setText] = useState("");
  // Counting is cheap, but memoising keeps it off every unrelated re-render.
  const stats = useMemo(() => analyzeText(text), [text]);

  return (
    <div className="space-y-4">
      {/* Live region: the counts update as the user types, and a screen reader
          user needs those updates without leaving the textarea. */}
      <section
        aria-live="polite"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {FIELDS.map((field) => (
          <div key={field.key} className="rounded-xl border border-white/5 bg-white/[0.025] p-4">
            <div className="text-2xl font-extrabold tabular-nums text-white">
              {stats[field.key].toLocaleString()}
            </div>
            <div className="mt-1 text-xs font-medium text-ink-200">{field.label}</div>
          </div>
        ))}
      </section>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ink-200">Your text</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Start typing or paste your text here…"
          className="h-96 w-full resize-y rounded-xl border border-white/10 bg-navy-900 p-4 text-sm leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/15"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-200">
        <span>
          {stats.words > 0
            ? `About ${stats.readingMinutes} minute${stats.readingMinutes === 1 ? "" : "s"} to read`
            : "Reading time appears once you start typing"}
        </span>
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            className="ml-auto inline-flex items-center gap-1.5 font-semibold text-ink-200 hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
