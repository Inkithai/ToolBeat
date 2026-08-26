"use client";

import { useMemo, useState } from "react";
import { investmentForecast } from "@/lib/tools/investment";

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

export default function InvestmentCalculatorClient() {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);

  const forecast = useMemo(() => {
    try {
      return { data: investmentForecast({ initial, monthly, annualRatePct: rate, years }), error: "" };
    } catch (caught) {
      return { data: null, error: caught instanceof Error ? caught.message : "Invalid terms." };
    }
  }, [initial, monthly, rate, years]);

  const field = "w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/50";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Initial deposit</span>
          <input type="number" min={0} step={500} value={Number.isFinite(initial) ? initial : ""} onChange={(event) => setInitial(Number(event.target.value))} className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Monthly contribution</span>
          <input type="number" min={0} step={50} value={Number.isFinite(monthly) ? monthly : ""} onChange={(event) => setMonthly(Number(event.target.value))} className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Annual rate (%)</span>
          <input type="number" min={0} max={100} step={0.1} value={Number.isFinite(rate) ? rate : ""} onChange={(event) => setRate(Number(event.target.value))} className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Years</span>
          <input type="number" min={1} max={600} value={Number.isFinite(years) ? years : ""} onChange={(event) => setYears(Number(event.target.value))} className={field} />
        </label>
      </div>

      {forecast.error && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
          {forecast.error}
        </p>
      )}

      {forecast.data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <ResultCard label="Final value" value={money(forecast.data.finalValue)} />
            <ResultCard label="Total contributed" value={money(forecast.data.totalContributed)} />
            <ResultCard label="Growth" value={money(forecast.data.totalGrowth)} hint="From monthly compounding" />
          </div>
          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-ink-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">Year</th>
                  <th className="px-3 py-2 font-semibold">Start</th>
                  <th className="px-3 py-2 font-semibold">Contributed</th>
                  <th className="px-3 py-2 font-semibold">Growth</th>
                  <th className="px-3 py-2 font-semibold">End</th>
                </tr>
              </thead>
              <tbody>
                {forecast.data.years.map((row) => (
                  <tr key={row.year} className="border-t border-white/[0.04]">
                    <td className="px-3 py-2 font-semibold text-ink-200">{row.year}</td>
                    <td className="px-3 py-2 font-mono text-ink-300">{money(row.startValue)}</td>
                    <td className="px-3 py-2 font-mono text-ink-300">{money(row.contributions)}</td>
                    <td className="px-3 py-2 font-mono text-emerald-300">{money(row.growth)}</td>
                    <td className="px-3 py-2 font-mono text-white">{money(row.endValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
