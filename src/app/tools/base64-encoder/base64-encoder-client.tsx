"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, Trash2 } from "lucide-react";
import { decodeBase64Utf8, encodeBase64Utf8 } from "@/lib/tools/base64";

type Direction = "encode" | "decode";

/**
 * Live conversion rather than a "run" button: every keystroke re-encodes.
 * Invalid Base64 while typing is a normal intermediate state, so the error is
 * informational, not modal.
 */
export default function Base64EncoderClient() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("encode");
  const [copied, setCopied] = useState(false);

  const convert = useCallback(
    (value: string, dir: Direction): { output: string; error: string } => {
      if (!value.trim()) return { output: "", error: "" };
      try {
        return { output: dir === "encode" ? encodeBase64Utf8(value) : decodeBase64Utf8(value), error: "" };
      } catch (caught: unknown) {
        return { output: "", error: caught instanceof Error ? caught.message : "Conversion failed." };
      }
    },
    [],
  );

  const { output, error } = useMemo(() => convert(input, direction), [convert, input, direction]);

  const swap = useCallback(() => {
    setDirection((current) => (current === "encode" ? "decode" : "encode"));
    // The old output becomes the new input — that is what "swap" means here.
    setInput(output);
  }, [output]);

  const copy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const clear = useCallback(() => setInput(""), []);

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center gap-2 rounded-xl border border-white/5 bg-white/[0.025] p-3">
        <div className="flex rounded-lg border border-white/10 bg-navy-900 p-0.5" role="group" aria-label="Direction">
          {(["encode", "decode"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDirection(option)}
              aria-pressed={direction === option}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                direction === option ? "bg-cyan-500 text-white" : "text-ink-200 hover:text-white"
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
        <span className="ml-auto text-xs text-slate-500">
          {direction === "encode" ? "Text → Base64" : "Base64 → text"} · Unicode-safe
        </span>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink-200">
            {direction === "encode" ? "Plain text" : "Base64"}
          </span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            placeholder={direction === "encode" ? "Type or paste text…" : "Paste Base64, e.g. aGVsbG8="}
            className="h-72 w-full resize-y rounded-xl border border-white/10 bg-navy-900 p-4 font-mono text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15"
          />
        </label>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-200">
              {direction === "encode" ? "Base64" : "Plain text"}
            </span>
            {output && (
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            spellCheck={false}
            placeholder={direction === "encode" ? "Base64 appears here." : "Decoded text appears here."}
            className="h-72 w-full resize-y rounded-xl border border-white/10 bg-navy-950 p-4 font-mono text-sm text-ink-50 outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-200">
        {input && <span>{input.length.toLocaleString()} characters in</span>}
        {output && <span>{output.length.toLocaleString()} characters out</span>}
        <button
          type="button"
          onClick={clear}
          className="ml-auto inline-flex items-center gap-1.5 font-semibold text-ink-200 hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>
    </div>
  );
}
