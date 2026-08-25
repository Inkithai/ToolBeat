"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, Trash2 } from "lucide-react";
import { decodeUrl, encodeUrl, type UrlEncodingMode } from "@/lib/tools/url-codec";
import IoWorkspace from "@/components/tools/io-workspace";

type Direction = "encode" | "decode";

export default function UrlEncoderClient() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("encode");
  const [mode, setMode] = useState<UrlEncodingMode>("component");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      return {
        output: direction === "encode" ? encodeUrl(input, mode) : decodeUrl(input, mode),
        error: "",
      };
    } catch (caught: unknown) {
      return { output: "", error: caught instanceof Error ? caught.message : "Conversion failed." };
    }
  }, [input, direction, mode]);

  const swap = useCallback(() => {
    setDirection((current) => (current === "encode" ? "decode" : "encode"));
    setInput(output);
  }, [output]);

  const copy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3">
        <div className="flex rounded-lg border border-white/10 bg-navy-900 p-0.5" role="group" aria-label="Direction">
          {(["encode", "decode"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDirection(option)}
              aria-pressed={direction === option}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                direction === option ? "bg-indigo-500 text-white" : "text-ink-200 hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={swap}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-ink-50 transition-colors hover:bg-white/10"
        >
          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" /> Swap
        </button>
        <div className="flex rounded-lg border border-white/10 bg-navy-900 p-0.5" role="group" aria-label="Encoding scope">
          {(["component", "uri"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              aria-pressed={mode === option}
              className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
                mode === option ? "bg-indigo-500/20 text-indigo-200" : "text-ink-200 hover:text-white"
              }`}
              title={option === "component" ? "Escapes everything — for one parameter value" : "Keeps :/?#[]@ separators — for a complete URL"}
            >
              {option === "component" ? "Value" : "Full URL"}
            </button>
          ))}
        </div>
      </section>

      <IoWorkspace
        inputLabel={direction === "encode" ? "Plain text" : "Encoded text"}
        outputLabel={direction === "encode" ? "Encoded" : "Decoded"}
        status={error ? "error" : output ? "complete" : "idle"}
        input={
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            placeholder={direction === "encode" ? "Text or URL to encode…" : "e.g. https%3A%2F%2Fexample.com%2Fa%20b"}
            className="field h-64 resize-y font-mono text-sm"
          />
        }
        output={
          <textarea
            value={output}
            readOnly
            spellCheck={false}
            placeholder="Result appears here."
            className="field h-64 resize-y font-mono text-sm"
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
      />

      {error && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-ink-200">
        <p className="max-w-xl">
          <span className="font-semibold text-ink-100">Value</span> mode escapes every reserved character — use it
          for a single query parameter. <span className="font-semibold text-ink-100">Full URL</span> mode keeps{" "}
          <code className="rounded bg-white/5 px-1 py-0.5">: / ? # = &amp;</code> intact so a complete URL stays
          clickable.
        </p>
        {input && (
          <button
            type="button"
            onClick={() => setInput("")}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 font-semibold text-ink-200 hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
