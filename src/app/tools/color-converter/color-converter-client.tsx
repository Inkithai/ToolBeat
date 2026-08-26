"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { contrastRatio, parseHex, rgbToHex, rgbToHsl } from "@/lib/tools/color";
import IoWorkspace from "@/components/tools/io-workspace";

type Parsed = {
  hex: string;
  rgb: string;
  hsl: string;
  error: string;
};

export default function ColorConverterClient() {
  const [input, setInput] = useState("#6366f1");
  const [copied, setCopied] = useState<string | null>(null);

  const parsed: Parsed = (() => {
    try {
      const rgb = parseHex(input);
      const hsl = rgbToHsl(rgb);
      return {
        hex: rgbToHex(rgb),
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        error: "",
      };
    } catch (caught) {
      return { hex: "", rgb: "", hsl: "", error: caught instanceof Error ? caught.message : "Invalid color." };
    }
  })();

  const copy = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 2000);
  };

  const rows = parsed.error
    ? []
    : [
        { label: "HEX", value: parsed.hex },
        { label: "RGB", value: parsed.rgb },
        { label: "HSL", value: parsed.hsl },
      ];

  return (
    <IoWorkspace
      inputLabel="Color"
      outputLabel="Values"
      status={parsed.error ? "error" : "complete"}
      footer={
        parsed.error ? (
          <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
            {parsed.error}
          </p>
        ) : (
          <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
            <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-ink-400">
              Contrast on black: <span className="font-bold text-white">{contrastRatio(parsed.hex, "#000000")}:1</span>
              {contrastRatio(parsed.hex, "#000000") >= 4.5 ? " (AA)" : ""}
            </p>
            <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-ink-400">
              Contrast on white: <span className="font-bold text-white">{contrastRatio(parsed.hex, "#ffffff")}:1</span>
              {contrastRatio(parsed.hex, "#ffffff") >= 4.5 ? " (AA)" : ""}
            </p>
          </div>
        )
      }
      input={
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span
              className="h-14 w-14 shrink-0 rounded-xl border border-white/10"
              style={{ backgroundColor: parsed.error ? "transparent" : parsed.hex }}
              aria-hidden="true"
            />
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="#6366f1 or #66f"
                spellCheck={false}
                className="field w-full font-mono text-sm"
              />
              <label className="flex items-center gap-2 text-xs text-ink-200">
                <input
                  type="color"
                  value={parsed.error ? "#000000" : parsed.hex}
                  onChange={(event) => setInput(event.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
                />
                or pick from the palette
              </label>
            </div>
          </div>
        </div>
      }
      output={
        rows.length ? (
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <span className="w-10 shrink-0 text-xs font-bold uppercase tracking-wider text-ink-500">{row.label}</span>
                <code className="min-w-0 flex-1 break-all font-mono text-sm text-ink-100">{row.value}</code>
                <button
                  type="button"
                  onClick={() => void copy(row.label, row.value)}
                  aria-label={`Copy ${row.label}`}
                  className="shrink-0 rounded-md border border-white/10 p-1.5 text-ink-400 transition-colors hover:border-indigo-400/30 hover:text-white"
                >
                  {copied === row.label ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            Enter a color to convert
          </div>
        )
      }
    />
  );
}
