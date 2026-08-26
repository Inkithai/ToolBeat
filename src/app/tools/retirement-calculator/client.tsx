"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [currentAge, setCurrentAge] = useState(30); const [retireAge, setRetireAge] = useState(65); const [currentSavings, setCurrentSavings] = useState(10000); const [monthlyContribution, setMonthlyContribution] = useState(500); const [returnRate, setReturnRate] = useState(7); const [inflationRate, setInflationRate] = useState(3);
  const result = useMemo(() => {
    const years = retireAge - currentAge; const monthlyReturn = returnRate / 100 / 12;
    let balance = currentSavings; const schedule: { age: number; balance: number }[] = [];
    for (let y = 0; y < years; y++) { for (let m = 0; m < 12; m++) { balance = balance * (1 + monthlyReturn) + monthlyContribution; } schedule.push({ age: currentAge + y + 1, balance }); }
    const realReturn = ((1 + returnRate / 100) / (1 + inflationRate / 100) - 1) * 100;
    const inflationAdjustedBalance = balance / Math.pow(1 + inflationRate / 100, years);
    const totalContributed = currentSavings + monthlyContribution * 12 * years;
    return { finalBalance: balance, totalContributed, interest: balance - totalContributed, inflationAdjusted: inflationAdjustedBalance, schedule, realReturn };
  }, [currentAge, retireAge, currentSavings, monthlyContribution, returnRate, inflationRate]);
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return (
    <IoWorkspace inputLabel="Retirement plan" outputLabel="Projected savings" status="complete"
      input={<div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1"><span className="text-xs text-ink-400">Current age</span><input type="number" value={currentAge} onChange={e => setCurrentAge(+e.target.value)} min={18} max={80} className="field w-full" /></label>
          <label className="space-y-1"><span className="text-xs text-ink-400">Retirement age</span><input type="number" value={retireAge} onChange={e => setRetireAge(+e.target.value)} min={currentAge+1} max={100} className="field w-full" /></label>
        </div>
        <label className="space-y-1"><span className="text-xs text-ink-400">Current savings ($)</span><input type="number" value={currentSavings} onChange={e => setCurrentSavings(+e.target.value)} min={0} step={1000} className="field w-full" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Monthly contribution ($)</span><input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(+e.target.value)} min={0} step={50} className="field w-full" /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1"><span className="text-xs text-ink-400">Annual return (%)</span><input type="number" value={returnRate} onChange={e => setReturnRate(+e.target.value)} min={0} max={30} step={0.5} className="field w-full" /></label>
          <label className="space-y-1"><span className="text-xs text-ink-400">Inflation (%)</span><input type="number" value={inflationRate} onChange={e => setInflationRate(+e.target.value)} min={0} max={20} step={0.5} className="field w-full" /></label>
        </div>
      </div>}
      output={<div className="space-y-3">
        <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center"><p className="text-xs text-ink-500">At retirement (age {retireAge})</p><p className="text-3xl font-bold text-white">{fmt(result.finalBalance)}</p><p className="text-xs text-ink-400">Inflation-adjusted: {fmt(result.inflationAdjusted)}</p></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center"><p className="text-[10px] text-ink-500">Contributed</p><p className="text-sm font-bold text-emerald-300">{fmt(result.totalContributed)}</p></div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center"><p className="text-[10px] text-ink-500">Interest earned</p><p className="text-sm font-bold text-indigo-300">{fmt(result.interest)}</p></div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center"><p className="text-[10px] text-ink-500">Real return</p><p className="text-sm font-bold text-white">{result.realReturn.toFixed(1)}%</p></div>
        </div>
      </div>}
    />
  );
}
