"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

/**
 * Shared shell for text-in / text-out tools: a monospace input, an optional
 * options row, live (or on-demand) transformation, and a copyable output.
 *
 * `transform` runs on every keystroke when `live` is true, or behind a button
 * otherwise. It may throw — the message is shown in place of the output, the
 * way the converters surface errors.
 */
export default function TextTransform({
  inputLabel = "Input",
  outputLabel = "Output",
  placeholder = "",
  initialInput = "",
  live = true,
  transform,
  options,
  onInputChange,
  inputRows = 12,
  outputRows = 12,
  outputKind = "text",
}: {
  inputLabel?: string;
  outputLabel?: string;
  placeholder?: string;
  initialInput?: string;
  live?: boolean;
  /** May return a string or a promise of one (for async engines like terser). */
  transform: (input: string) => string | Promise<string>;
  options?: ReactNode;
  /** Notified whenever the input text changes (or is cleared). */
  onInputChange?: (value: string) => void;
  inputRows?: number;
  outputRows?: number;
  /** "text" renders pre-wrap prose, "code" keeps monospace alignment. */
  outputKind?: "text" | "code";
}) {
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const runIdRef = useRef(0);
  const run = useCallback(
    async (value: string) => {
      const id = ++runIdRef.current;
      if (!value.trim()) {
        if (id === runIdRef.current) {
          setOutput("");
          setError("");
        }
        return;
      }
      try {
        const result = await transform(value);
        if (id !== runIdRef.current) return; // a newer run superseded this one
        setOutput(result);
        setError("");
      } catch (caught) {
        if (id !== runIdRef.current) return;
        setError(caught instanceof Error ? caught.message : "Something went wrong.");
        setOutput("");
      }
    },
    [transform],
  );

  useEffect(() => {
    if (live) void run(input);
  }, [live, input, run]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const outputClass = useMemo(
    () =>
      `field w-full overflow-auto whitespace-pre-wrap text-sm leading-relaxed ${
        outputKind === "code" ? "font-mono" : ""
      }`,
    [outputKind],
  );

  return (
    <IoWorkspace
      inputLabel={inputLabel}
      outputLabel={outputLabel}
      status={error ? "error" : output ? "complete" : "idle"}
      outputAction={
        output ? (
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        ) : undefined
      }
      footer={
        error ? (
          <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
            {error}
          </p>
        ) : undefined
      }
      input={
        <div className="space-y-3">
          {options}
          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              onInputChange?.(event.target.value);
            }}
            placeholder={placeholder}
            rows={inputRows}
            spellCheck={false}
            className={`field w-full resize-y text-sm ${outputKind === "code" ? "font-mono" : ""}`}
          />
          {input && (
            <button
              type="button"
              onClick={() => {
                setInput("");
                setOutput("");
                setError("");
                onInputChange?.("");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition-colors hover:text-rose-300"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      }
      process={
        live ? undefined : (
          <button type="button" onClick={() => void run(input)} className="btn-primary" disabled={!input.trim()}>
            Transform
          </button>
        )
      }
      output={
        output ? (
          <pre className={`${outputClass} min-h-[10rem]`} style={{ height: `${outputRows}rem` }}>
            {output}
          </pre>
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 text-sm text-ink-600" style={{ height: `${outputRows}rem` }}>
            {error ? " " : "Output appears here"}
          </div>
        )
      }
    />
  );
}
