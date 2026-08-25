"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { analyzeText } from "@/lib/tools/word-count";
import IoWorkspace from "@/components/tools/io-workspace";

const FIELDS = [
  { key: "words", label: "Words" },
  { key: "characters", label: "Characters" },
  { key: "charactersNoSpaces", label: "No spaces" },
  { key: "sentences", label: "Sentences" },
  { key: "paragraphs", label: "Paragraphs" },
] as const;

export default function WordCounterClient() {
  const [text, setText] = useState("");
  const stats = useMemo(() => analyzeText(text), [text]);

  return (
    <IoWorkspace
      status={text ? "complete" : "idle"}
      input={
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Start typing or paste your text here…"
          className="field h-80 resize-y text-sm leading-relaxed"
        />
      }
      output={
        <div aria-live="polite" className="grid grid-cols-2 gap-4">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <p className="meta text-ink-500">{field.label}</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-white">{stats[field.key].toLocaleString()}</p>
            </div>
          ))}
        </div>
      }
      footer={
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-200">
          <span>
            {stats.words > 0
              ? `About ${stats.readingMinutes} minute${stats.readingMinutes === 1 ? "" : "s"} to read`
              : "Reading time appears once you start typing"}
          </span>
          {text && (
            <button type="button" onClick={() => setText("")} className="ml-auto inline-flex items-center gap-1.5 font-semibold hover:text-white">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      }
    />
  );
}
