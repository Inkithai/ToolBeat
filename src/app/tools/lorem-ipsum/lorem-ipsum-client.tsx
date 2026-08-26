"use client";

import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { loremText, type LoremKind } from "@/lib/tools/lorem";
import IoWorkspace from "@/components/tools/io-workspace";

const KINDS: Array<{ value: LoremKind; label: string }> = [
  { value: "paragraphs", label: "Paragraphs" },
  { value: "sentences", label: "Sentences" },
  { value: "words", label: "Words" },
];

export default function LoremIpsumClient() {
  const [kind, setKind] = useState<LoremKind>("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState(() => loremText("paragraphs", 3, Date.now()));
  const [copied, setCopied] = useState(false);

  const generate = () => {
    setCopied(false);
    setOutput(loremText(kind, count, Date.now()));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <IoWorkspace
      inputLabel="Options"
      outputLabel="Lorem Ipsum"
      status="complete"
      outputAction={
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      }
      process={
        <button type="button" onClick={generate} className="btn-primary">
          <Sparkles className="h-4 w-4" />
          Generate new
        </button>
      }
      input={
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-200">
            Generate
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as LoremKind)}
              className="field py-1.5 text-xs"
            >
              {KINDS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-200">
            How many
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="w-20 rounded-lg border border-white/10 bg-navy-900 px-2 py-1.5 text-sm text-white outline-none focus:border-indigo-400/50"
            />
          </label>
          <p className="text-xs text-ink-600">Changes apply on the next generate.</p>
        </div>
      }
      output={<pre className="field min-h-[16rem] w-full whitespace-pre-wrap overflow-auto text-sm leading-relaxed">{output}</pre>}
    />
  );
}
