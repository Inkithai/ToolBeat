"use client";

import { useMemo, useState } from "react";
import { simplifyRatio } from "@/lib/tools/ratio";

function ResultCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="meta text-ink-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export default function RatioCalculatorClient() {
  const [a, setA] = useState(30);
  const [b, setB] = useState(70);

  const result = useMemo(() => {
    try {
      return { data: simplifyRatio(a, b), error: "" };
    } catch (caught) {
      return { data: null, error: caught instanceof Error ? caught.message : "Invalid inputs." };
    }
  }, [a, b]);

  const field = "w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/50";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Value A</span>
          <input type="number" step="any" value={Number.isFinite(a) ? a : ""} onChange={(event) => setA(Number(event.target.value))} className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Value B</span>
          <input type="number" step="any" value={Number.isFinite(b) ? b : ""} onChange={(event) => setB(Number(event.target.value))} className={field} />
        </label>
      </div>

      {result.error && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
          {result.error}
        </p>
      )}

      {result.data && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <ResultCard label="Simplified" value={result.data.display} hint="A : B in lowest terms" />
            <ResultCard label="Share of A" value={`${result.data.aPct.toFixed(1)}%`} hint={`A is ${result.data.aPct.toFixed(1)}% of the whole`} />
            <ResultCard label="Share of B" value={`${result.data.bPct.toFixed(1)}%`} hint={`B is ${result.data.bPct.toFixed(1)}% of the whole`} />
          </div>
          <div className="flex h-4 overflow-hidden rounded-full border border-white/10">
            <div className="bg-indigo-500/70" style={{ width: `${result.data.aPct}%` }} />
            <div className="bg-sky-500/70" style={{ width: `${result.data.bPct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
