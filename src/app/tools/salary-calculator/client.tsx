"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [annual, setAnnual] = useState(75000);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [weeksPerYear, setWeeksPerYear] = useState(52);
  const [taxRate, setTaxRate] = useState(25);

  const result = useMemo(() => {
    const monthly = annual / 12;
    const biweekly = annual / 26;
    const weekly = annual / weeksPerYear;
    const daily = weekly / (hoursPerWeek / 5);
    const hourly = weekly / hoursPerWeek;

    const afterTaxAnnual = annual * (1 - taxRate / 100);
    const afterTaxMonthly = afterTaxAnnual / 12;
    const afterTaxHourly = hourly * (1 - taxRate / 100);

    return { monthly, biweekly, weekly, daily, hourly, afterTaxAnnual, afterTaxMonthly, afterTaxHourly };
  }, [annual, hoursPerWeek, weeksPerYear, taxRate]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <IoWorkspace
      inputLabel="Salary details"
      outputLabel="Pay breakdown"
      status={result ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Annual salary ($)</span>
            <input type="number" value={annual} onChange={e => setAnnual(+e.target.value)} min={0} step={1000} className="field w-full" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">Hours / week</span>
              <input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(+e.target.value)} min={1} max={168} className="field w-full" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">Weeks / year</span>
              <input type="number" value={weeksPerYear} onChange={e => setWeeksPerYear(+e.target.value)} min={1} max={52} className="field w-full" />
            </label>
          </div>
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Estimated tax rate (%)</span>
            <input type="number" value={taxRate} onChange={e => setTaxRate(+e.target.value)} min={0} max={100} step={1} className="field w-full" />
          </label>
        </div>
      }
      output={
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Gross pay</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Annual", value: fmt(annual) },
              { label: "Monthly", value: fmt(result.monthly) },
              { label: "Bi-weekly", value: fmt(result.biweekly) },
              { label: "Weekly", value: fmt(result.weekly) },
              { label: "Daily", value: fmt(result.daily) },
              { label: "Hourly", value: fmt(result.hourly) },
            ].map(item => (
              <div key={item.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <p className="text-[10px] text-ink-500">{item.label}</p>
                <p className="font-mono text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500">After tax ({taxRate}%)</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-emerald-400/10 bg-emerald-500/5 px-3 py-2 text-center">
              <p className="text-[10px] text-ink-500">Annual</p>
              <p className="font-mono text-sm font-bold text-emerald-300">{fmt(result.afterTaxAnnual)}</p>
            </div>
            <div className="rounded-lg border border-emerald-400/10 bg-emerald-500/5 px-3 py-2 text-center">
              <p className="text-[10px] text-ink-500">Monthly</p>
              <p className="font-mono text-sm font-bold text-emerald-300">{fmt(result.afterTaxMonthly)}</p>
            </div>
            <div className="rounded-lg border border-emerald-400/10 bg-emerald-500/5 px-3 py-2 text-center">
              <p className="text-[10px] text-ink-500">Hourly</p>
              <p className="font-mono text-sm font-bold text-emerald-300">{fmt(result.afterTaxHourly)}</p>
            </div>
          </div>
        </div>
      }
    />
  );
}
