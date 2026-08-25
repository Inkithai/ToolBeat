"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { analyzeText } from "@/lib/tools/word-count";
import { percentOfValue, roundTo2 } from "@/lib/tools/percentage";
import IoWorkspace from "@/components/tools/io-workspace";

type PlaygroundId = "json" | "words" | "calc" | "uuid";

const TABS: Array<{ id: PlaygroundId; label: string; href: string; hint: string }> = [
  { id: "json", label: "JSON Formatter", href: "/tools/json-formatter", hint: '{ "name": "Inkithai" }' },
  { id: "words", label: "Word Counter", href: "/tools/word-counter", hint: "WORDS 482" },
  { id: "calc", label: "Percentage", href: "/tools/percentage-calculator", hint: "20% of 500 → 100" },
  { id: "uuid", label: "UUID", href: "/tools/uuid-generator", hint: "v4 · on-device" },
];

const SAMPLE_JSON = '{"hello":1,"name":"Inkithai"}';
const SAMPLE_TEXT = "Paste anything here. ToolBeat counts words, characters and sentences locally.";

function formatJson(value: string): { output: string; error: string } {
  if (!value.trim()) return { output: "", error: "" };
  try {
    return { output: JSON.stringify(JSON.parse(value), null, 2), error: "" };
  } catch (caught) {
    return { output: "", error: caught instanceof Error ? caught.message : "Invalid JSON" };
  }
}

export default function StartUseful() {
  const [tab, setTab] = useState<PlaygroundId>("json");
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [textInput, setTextInput] = useState(SAMPLE_TEXT);
  const [percent, setPercent] = useState("20");
  const [base, setBase] = useState("500");
  const [uuid] = useState("7f3c1a2e-9b44-4d21-a8c0-12e9f0b3d6aa");

  const json = useMemo(() => formatJson(jsonInput), [jsonInput]);
  const stats = useMemo(() => analyzeText(textInput), [textInput]);
  const calc = useMemo(() => {
    const percentage = Number(percent);
    const value = Number(base);
    if (!Number.isFinite(percentage) || !Number.isFinite(value)) return null;
    return roundTo2(percentOfValue(percentage, value));
  }, [percent, base]);

  const active = TABS.find((item) => item.id === tab) ?? TABS[0];

  return (
    <section className="border-b border-white/[0.06] px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="start-useful-heading">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="meta mb-3 text-cyan-400">● Start with something useful</p>
            <h2 id="start-useful-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Try a real transformation
            </h2>
          </div>
          <Link href={active.href} className="text-sm font-semibold text-indigo-300 motion-fn hover:text-white">
            Open full tool →
          </Link>
        </div>

        <div className="-mx-4 mb-4 overflow-x-auto px-4 [scrollbar-width:thin]">
          <div className="flex gap-2">
            {TABS.map((item) => {
              const selected = item.id === tab;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-pressed={selected}
                  className={`min-w-[180px] border px-3 py-3 text-left motion-nav ${
                    selected ? "border-indigo-400/40 bg-navy-900" : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="block text-sm font-semibold text-white">{item.label}</span>
                  <span className="mt-1 block font-mono text-[11px] text-ink-500">{item.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border border-white/10 bg-navy-900 p-4 sm:p-5">
          {tab === "json" && (
            <IoWorkspace
              status={json.error ? "error" : json.output ? "complete" : "idle"}
              input={
                <textarea
                  value={jsonInput}
                  onChange={(event) => setJsonInput(event.target.value)}
                  spellCheck={false}
                  className="field h-52 resize-y font-mono text-sm"
                  aria-label="JSON input"
                />
              }
              output={
                json.error ? (
                  <p role="alert" className="text-sm text-rose-300">
                    {json.error}
                  </p>
                ) : (
                  <pre className="h-52 overflow-auto font-mono text-sm leading-relaxed text-cyan-200">
                    {json.output || "Formatted JSON appears here."}
                  </pre>
                )
              }
            />
          )}

          {tab === "words" && (
            <IoWorkspace
              status="complete"
              input={
                <textarea
                  value={textInput}
                  onChange={(event) => setTextInput(event.target.value)}
                  className="field h-52 resize-y text-sm"
                  aria-label="Text to count"
                />
              }
              output={
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Words", value: stats.words },
                    { label: "Characters", value: stats.characters },
                    { label: "Sentences", value: stats.sentences },
                    { label: "Minutes", value: stats.readingMinutes },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="meta text-ink-500">{item.label}</p>
                      <p className="mt-1 font-mono text-3xl font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              }
            />
          )}

          {tab === "calc" && (
            <IoWorkspace
              status={calc === null ? "error" : "complete"}
              input={
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="meta mb-2 block text-ink-500">Percent</span>
                    <input
                      type="number"
                      value={percent}
                      onChange={(event) => setPercent(event.target.value)}
                      className="field font-mono"
                      aria-label="Percentage"
                    />
                  </label>
                  <label>
                    <span className="meta mb-2 block text-ink-500">Of</span>
                    <input
                      type="number"
                      value={base}
                      onChange={(event) => setBase(event.target.value)}
                      className="field font-mono"
                      aria-label="Base value"
                    />
                  </label>
                </div>
              }
              output={
                <div>
                  <p className="font-mono text-5xl font-semibold tracking-tight text-white">{calc === null ? "—" : calc}</p>
                  <p className="mt-2 text-sm text-ink-500">
                    {percent || "0"}% of {base || "0"}
                  </p>
                </div>
              }
            />
          )}

          {tab === "uuid" && (
            <IoWorkspace
              status="complete"
              inputLabel="Generate"
              outputLabel="UUID v4"
              input={<p className="text-sm text-ink-400">Created on this device. Nothing is sent anywhere.</p>}
              output={<p className="break-all font-mono text-sm text-cyan-200">{uuid}</p>}
            />
          )}
        </div>
      </div>
    </section>
  );
}
