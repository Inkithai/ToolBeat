"use client";

import { useMemo, useState } from "react";
import { computeRoi } from "@/lib/tools/roi";

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

export default function RoiCalculatorClient() {
  const [cost, setCost] = useState(5000);
  const [endValue, setEndValue] = useState(8500);

  const result = useMemo(() => {
    try {
      return { data: computeRoi({ cost, endValue }), error: "" };
    } catch (caught) {
      return { data: null, error: caught instanceof Error ? caught.message : "Invalid inputs." };
    }
  }, [cost, endValue]);

  const field = "w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/50";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">What you invested</span>
          <input type="number" min={0} step={100} value={Number.isFinite(cost) ? cost : ""} onChange={(event) => setCost(Number(event.target.value))} className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Current value</span>
          <input type="number" min={0} step={100} value={Number.isFinite(endValue) ? endValue : ""} onChange={(event) => setEndValue(Number(event.target.value))} className={field} />
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
            label="ROI"
            value={`${result.data.roiPct >= 0 ? "+" : ""}${result.data.roiPct.toFixed(2)}%`}
            hint={result.data.roiPct >= 0 ? "Gain on the investment" : "Loss on the investment"}
          />
          <ResultCard label="Profit" value={money(result.data.profit)} />
          <ResultCard label="Multiple" value={`${result.data.multiple.toFixed(2)}×`} hint="Return per dollar invested" />
        </div>
      )}
    </div>
  );
}
