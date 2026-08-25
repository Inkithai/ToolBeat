"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import {
  convertUnit,
  formatConverted,
  UNIT_CATEGORIES,
  type UnitCategory,
} from "@/lib/tools/unit-convert";

export default function UnitConverterClient() {
  const [categoryId, setCategoryId] = useState<UnitCategory>("length");
  const category = useMemo(
    () => UNIT_CATEGORIES.find((entry) => entry.id === categoryId) ?? UNIT_CATEGORIES[0],
    [categoryId],
  );

  const [fromUnit, setFromUnit] = useState(category.units[0].id);
  const [toUnit, setToUnit] = useState(category.units[1]?.id ?? category.units[0].id);
  const [input, setInput] = useState("1");

  const chooseCategory = (next: UnitCategory) => {
    const nextCategory = UNIT_CATEGORIES.find((entry) => entry.id === next) ?? UNIT_CATEGORIES[0];
    setCategoryId(next);
    setFromUnit(nextCategory.units[0].id);
    setToUnit(nextCategory.units[1]?.id ?? nextCategory.units[0].id);
  };

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    const value = Number(input);
    return Number.isFinite(value) ? value : null;
  }, [input]);

  const output = useMemo(() => {
    if (parsed === null) return null;
    try {
      return formatConverted(convertUnit(parsed, categoryId, fromUnit, toUnit));
    } catch {
      return null;
    }
  }, [parsed, categoryId, fromUnit, toUnit]);

  const fromLabel = category.units.find((u) => u.id === fromUnit)?.label ?? fromUnit;
  const toLabel = category.units.find((u) => u.id === toUnit)?.label ?? toUnit;

  return (
    <div className="space-y-5">
      <section aria-label="Unit category">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {UNIT_CATEGORIES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => chooseCategory(entry.id)}
              aria-pressed={categoryId === entry.id}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                categoryId === entry.id
                  ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-200 shadow-[0_0_16px_-6px_rgba(139,92,246,0.7)]"
                  : "border-white/10 bg-transparent text-ink-400 hover:border-white/20 hover:text-ink-200"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-300">From</span>
            <select
              value={fromUnit}
              onChange={(event) => setFromUnit(event.target.value)}
              className="field font-semibold"
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-300">Value</span>
            <input
              type="number"
              inputMode="decimal"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="0"
              className="field font-mono text-lg"
            />
          </label>
        </div>

        <div className="flex justify-center pb-1 sm:pb-3">
          <button
            type="button"
            onClick={swap}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-indigo-400/25 bg-indigo-500/10 text-indigo-300 transition-all hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300"
            aria-label="Swap units"
            title="Swap units"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-300">To</span>
            <select
              value={toUnit}
              onChange={(event) => setToUnit(event.target.value)}
              className="field font-semibold"
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-ink-300">Result</span>
            <div
              className="flex min-h-[48px] items-center rounded-xl border border-indigo-400/25 bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 px-4 py-3 font-mono text-lg font-bold text-white"
              aria-live="polite"
            >
              {output ?? "—"}
            </div>
          </div>
        </div>
      </section>

      <p className="text-center text-sm text-ink-400" aria-live="polite">
        {parsed !== null && output !== null ? (
          <>
            <span className="font-semibold text-ink-200">{input}</span> {fromLabel} ={" "}
            <span className="font-semibold text-cyan-300">{output}</span> {toLabel}
          </>
        ) : (
          "Enter a number to convert between units."
        )}
      </p>
    </div>
  );
}
