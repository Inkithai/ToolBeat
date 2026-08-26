"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

// US Federal tax brackets 2024 (single filer)
const TAX_BRACKETS = [
  { min: 0, max: 11600, rate: 10 },
  { min: 11600, max: 47150, rate: 12 },
  { min: 47150, max: 100525, rate: 22 },
  { min: 100525, max: 191950, rate: 24 },
  { min: 191950, max: 243725, rate: 32 },
  { min: 243725, max: 609350, rate: 35 },
  { min: 609350, max: Infinity, rate: 37 },
];

export default function Client() {
  const [income, setIncome] = useState(75000);
  const [filingStatus, setFilingStatus] = useState<"single" | "married">("single");
  const [deduction, setDeduction] = useState(14600);
  const [stateRate, setStateRate] = useState(5);

  const result = useMemo(() => {
    const taxableIncome = Math.max(0, income - deduction);

    // Federal tax calculation
    let federalTax = 0;
    const bracketDetails: { rate: number; taxable: number; tax: number }[] = [];
    let remaining = taxableIncome;

    for (const bracket of TAX_BRACKETS) {
      if (remaining <= 0) break;
      const bracketSize = bracket.max - bracket.min;
      const taxableInBracket = Math.min(remaining, bracketSize);
      const taxInBracket = taxableInBracket * (bracket.rate / 100);
      federalTax += taxInBracket;
      remaining -= taxableInBracket;
      if (taxableInBracket > 0) {
        bracketDetails.push({ rate: bracket.rate, taxable: taxableInBracket, tax: taxInBracket });
      }
    }

    const stateTax = taxableIncome * (stateRate / 100);
    const totalTax = federalTax + stateTax;
    const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
    const takeHome = income - totalTax;

    return { federalTax, stateTax, totalTax, effectiveRate, takeHome, taxableIncome, bracketDetails };
  }, [income, deduction, stateRate]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <IoWorkspace
      inputLabel="Income details"
      outputLabel="Tax breakdown"
      status={result ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Gross annual income ($)</span>
            <input type="number" value={income} onChange={e => setIncome(+e.target.value)} min={0} step={1000} className="field w-full" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Filing status</span>
            <select value={filingStatus} onChange={e => setFilingStatus(e.target.value as "single" | "married")} className="field w-full">
              <option value="single">Single</option>
              <option value="married">Married filing jointly</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Standard deduction ($)</span>
            <input type="number" value={deduction} onChange={e => setDeduction(+e.target.value)} min={0} className="field w-full" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">State tax rate (%)</span>
            <input type="number" value={stateRate} onChange={e => setStateRate(+e.target.value)} min={0} max={20} step={0.5} className="field w-full" />
          </label>
        </div>
      }
      output={
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center">
              <p className="text-[10px] text-ink-500">Take-home pay</p>
              <p className="text-2xl font-bold text-white">{fmt(result.takeHome)}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <p className="text-[10px] text-ink-500">Effective tax rate</p>
              <p className="text-2xl font-bold text-rose-300">{result.effectiveRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <span className="text-xs text-ink-400">Taxable income</span>
              <span className="text-sm font-semibold text-white">{fmt(result.taxableIncome)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <span className="text-xs text-ink-400">Federal tax</span>
              <span className="text-sm font-semibold text-rose-300">{fmt(result.federalTax)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <span className="text-xs text-ink-400">State tax</span>
              <span className="text-sm font-semibold text-rose-300">{fmt(result.stateTax)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-rose-400/20 bg-rose-500/5 px-3 py-2">
              <span className="text-xs font-bold text-ink-300">Total tax</span>
              <span className="text-sm font-bold text-rose-300">{fmt(result.totalTax)}</span>
            </div>
          </div>
          {result.bracketDetails.length > 0 && (
            <details>
              <summary className="cursor-pointer text-xs text-ink-500 hover:text-white">Federal bracket breakdown</summary>
              <div className="mt-2 space-y-1">
                {result.bracketDetails.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="text-ink-500">{b.rate}% on {fmt(b.taxable)}</span>
                    <span className="text-ink-300">{fmt(b.tax)}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      }
    />
  );
}
