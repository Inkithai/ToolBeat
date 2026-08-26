"use client";

import { useMemo, useState } from "react";
import { computeCagr } from "@/lib/tools/cagr";

function ResultCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="meta text-ink-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function CagrCalculatorClient() {
  const [startValue, setStartValue] = useState(10000);
  const [endValue, setEndValue] = useState(25000);
  const [years, setYears] = useState(5);

  const result = useMemo(() => {
    try {
      return { data: computeCagr({ startValue, endValue, years }), error: "" };
    } catch (caught) {
      return { data: null, error: caught instanceof Error ? caught.message : "Invalid inputs." };
    }
  }, [startValue, endValue, years]);

  const field = "w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/50";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Start value</span>
          <input type="number" min={0} step={500} value={Number.isFinite(startValue) ? startValue : ""} onChange={(event) => setStartValue(Number(event.target.value))} className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">End value</span>
          <input type="number" min={0} step={500} value={Number.isFinite(endValue) ? endValue : ""} onChange={(event) => setEndValue(Number(event.target.value))} className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Years</span>
          <input type="number" min={1} step={1} value={Number.isFinite(years) ? years : ""} onChange={(event) => setYears(Number(event.target.value))} className={field} />
        </label>
      </div>

      {result.error && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
          {result.error}
        </p>
      )}

      {result.data && (
        <div className="grid gap-3 sm:grid-cols-3">
          <ResultCard
            label="CAGR"
            value={`${result.data.cagrPct >= 0 ? "+" : ""}${result.data.cagrPct.toFixed(2)}%`}
            hint="Average annual growth, compounded"
          />
          <ResultCard label="Total return" value={`${result.data.totalReturnPct >= 0 ? "+" : ""}${result.data.totalReturnPct.toFixed(2)}%`} hint={`${money(startValue)} → ${money(endValue)}`} />
          <ResultCard label="Multiplier" value={`${result.data.multiplier.toFixed(2)}×`} />
        </div>
      )}
    </div>
  );
}
