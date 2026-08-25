"use client";

import { useMemo, useState } from "react";
import { BookOpen, Mic2, Trash2 } from "lucide-react";
import {
  estimateReadingTime,
  formatDuration,
  READING_PACE_WPM,
  type ReadingPace,
} from "@/lib/tools/reading-time";
import IoWorkspace from "@/components/tools/io-workspace";

const PACES: readonly { id: ReadingPace; label: string; hint: string }[] = [
  { id: "slow", label: "Slow", hint: `${READING_PACE_WPM.slow} wpm` },
  { id: "average", label: "Average", hint: `${READING_PACE_WPM.average} wpm` },
  { id: "fast", label: "Fast", hint: `${READING_PACE_WPM.fast} wpm` },
];

export default function ReadingTimeClient() {
  const [text, setText] = useState("");
  const [pace, setPace] = useState<ReadingPace>("average");
  const result = useMemo(() => estimateReadingTime(text, pace), [text, pace]);

  return (
    <div className="space-y-5">
      <section aria-label="Reading pace">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
          Silent reading pace
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PACES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPace(option.id)}
              aria-pressed={pace === option.id}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                pace === option.id
                  ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-200 shadow-[0_0_16px_-6px_rgba(139,92,246,0.7)]"
                  : "border-white/10 bg-transparent text-ink-400 hover:border-white/20 hover:text-ink-200"
              }`}
              title={option.hint}
            >
              {option.label}
              <span className="ml-1.5 opacity-60">{option.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section
        className="grid gap-3 sm:grid-cols-2"
        aria-live="polite"
        aria-label="Time estimates"
      >
        <div className="rounded-2xl border border-indigo-400/25 bg-gradient-to-br from-indigo-500/15 to-transparent p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-300">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Reading time
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {formatDuration(result.readingMinutes, result.readingSeconds, result.readingTotalSeconds)}
          </p>
          <p className="mt-2 text-xs text-ink-400">
            At {READING_PACE_WPM[pace]} words per minute
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 to-transparent p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
            <Mic2 className="h-3.5 w-3.5" aria-hidden="true" />
            Speaking time
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {formatDuration(
              result.speakingMinutes,
              result.speakingSeconds,
              result.speakingTotalSeconds,
            )}
          </p>
          <p className="mt-2 text-xs text-ink-400">At 150 words per minute</p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.025] p-4">
          <div className="text-2xl font-extrabold tabular-nums text-white">
            {result.words.toLocaleString()}
          </div>
          <div className="mt-1 text-xs font-medium text-ink-300">Words</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.025] p-4">
          <div className="text-2xl font-extrabold tabular-nums text-white">
            {result.characters.toLocaleString()}
          </div>
          <div className="mt-1 text-xs font-medium text-ink-300">Characters</div>
        </div>
      </div>

      <IoWorkspace
        status={text ? "complete" : "idle"}
        input={
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste an article, script or essay to estimate how long it takes to read or present…"
            className="field h-72 resize-y leading-relaxed"
          />
        }
        output={
          <div className="space-y-4">
            <div>
              <p className="meta text-ink-500">Reading</p>
              <p className="font-mono text-3xl font-semibold text-white">
                {formatDuration(result.readingMinutes, result.readingSeconds, result.readingTotalSeconds)}
              </p>
            </div>
            <div>
              <p className="meta text-cyan-400">Speaking</p>
              <p className="font-mono text-3xl font-semibold text-white">
                {formatDuration(result.speakingMinutes, result.speakingSeconds, result.speakingTotalSeconds)}
              </p>
            </div>
          </div>
        }
      />

      {text && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setText("")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      )}
    </div>
  );
}
