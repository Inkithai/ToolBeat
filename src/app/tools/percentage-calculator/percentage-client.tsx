"use client";

import { useMemo, useState } from "react";
import { percentChange, percentOfValue, roundTo2, shareAsPercent } from "@/lib/tools/percentage";

type Mode = "of" | "share" | "change";

const MODES: readonly { id: Mode; label: string; formula: string }[] = [
  { id: "of", label: "X% of Y", formula: "What is a percentage of a value?" },
  { id: "share", label: "X is what % of Y", formula: "What share of a total is a value?" },
  { id: "change", label: "% change", formula: "How much did a value grow or shrink?" },
];

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 });
const percentFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink-200">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
        className="w-full rounded-xl border border-white/10 bg-navy-900 px-4 py-3 font-mono text-lg text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/15"
      />
    </label>
  );
}

export default function PercentageClient() {
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const parse = (value: string): number | null => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const result = useMemo(() => {
    const x = parse(a);
    const y = parse(b);
    if (x === null || y === null) return null;
    const raw = mode === "of" ? percentOfValue(x, y) : mode === "share" ? shareAsPercent(x, y) : percentChange(x, y);
    if (!Number.isFinite(raw)) return { text: mode === "share" && y === 0 ? "A total of 0 has no percentage." : "Cannot divide by 0." };
    const rounded = roundTo2(raw);
    return {
      text: mode === "of" ? numberFormat.format(rounded) : `${percentFormat.format(rounded)}%`,
      hint:
        mode === "of"
          ? `${percentFormat.format(x)}% of ${numberFormat.format(y)}`
          : mode === "share"
            ? `${numberFormat.format(x)} of ${numberFormat.format(y)}`
            : `${numberFormat.format(x)} → ${numberFormat.format(y)}${rounded >= 0 ? " (increase)" : " (decrease)"}`,
    };
  }, [a, b, mode]);

  const fields: Record<Mode, { a: string; b: string }> = {
    of: { a: "Percentage (X%)", b: "Of value (Y)" },
    share: { a: "Value (X)", b: "Total (Y)" },
    change: { a: "From (before)", b: "To (after)" },
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-white/5 bg-white/[0.025] p-3" aria-label="Calculation type">
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              aria-pressed={mode === option.id}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                mode === option.id
                  ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300"
                  : "border-white/10 bg-transparent text-slate-400 hover:border-white/20 hover:text-ink-200"
              }`}
              title={option.formula}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <NumberField label={fields[mode].a} value={a} onChange={setA} />
        <NumberField label={fields[mode].b} value={b} onChange={setB} />
      </section>

      <section
        className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 px-6 py-8 text-center"
        aria-live="polite"
        aria-label="Result"
      >
        {result ? (
          <>
            <p className="font-mono text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{result.text}</p>
            {"hint" in result && result.hint && <p className="mt-2 text-sm text-ink-200">{result.hint}</p>}
          </>
        ) : (
          <p className="text-sm text-ink-200">Fill in both fields — the answer appears instantly.</p>
        )}
      </section>
    </div>
  );
}
