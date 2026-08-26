"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [fixedCosts, setFixedCosts] = useState(10000);
  const [pricePerUnit, setPricePerUnit] = useState(50);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(20);
  const [targetProfit, setTargetProfit] = useState(0);

  const result = useMemo(() => {
    if (pricePerUnit <= variableCostPerUnit) return null;
    const contribution = pricePerUnit - variableCostPerUnit;
    const breakEvenUnits = Math.ceil((fixedCosts + targetProfit) / contribution);
    const breakEvenRevenue = breakEvenUnits * pricePerUnit;
    const margin = ((contribution / pricePerUnit) * 100).toFixed(1);
    return { breakEvenUnits, breakEvenRevenue, contribution, margin };
  }, [fixedCosts, pricePerUnit, variableCostPerUnit, targetProfit]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <IoWorkspace
      inputLabel="Costs & pricing"
      outputLabel="Break-even analysis"
      status={result ? "complete" : "error"}
      input={
        <div className="space-y-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Fixed costs ($)</span>
            <input type="number" value={fixedCosts} onChange={e => setFixedCosts(+e.target.value)} min={0} className="field w-full" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Price per unit ($)</span>
            <input type="number" value={pricePerUnit} onChange={e => setPricePerUnit(+e.target.value)} min={0} step={0.01} className="field w-full" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Variable cost per unit ($)</span>
            <input type="number" value={variableCostPerUnit} onChange={e => setVariableCostPerUnit(+e.target.value)} min={0} step={0.01} className="field w-full" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Target profit ($, optional)</span>
            <input type="number" value={targetProfit} onChange={e => setTargetProfit(+e.target.value)} min={0} className="field w-full" />
          </label>
        </div>
      }
      output={
        result ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center">
              <p className="text-xs text-ink-500">Break-even point</p>
              <p className="text-3xl font-bold text-white">{result.breakEvenUnits.toLocaleString()} units</p>
              <p className="mt-1 text-sm text-ink-400">= {fmt(result.breakEvenRevenue)} in revenue</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-[10px] text-ink-500">Contribution margin</p>
                <p className="text-lg font-bold text-emerald-300">{fmt(result.contribution)}</p>
                <p className="text-[10px] text-ink-500">per unit</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-[10px] text-ink-500">Margin ratio</p>
                <p className="text-lg font-bold text-indigo-300">{result.margin}%</p>
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="mb-1 flex justify-between text-[10px] text-ink-500">
                <span>0 units</span>
                <span>Break-even: {result.breakEvenUnits}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]">
                <div className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" style={{ width: "100%" }} />
              </div>
              <p className="mt-1 text-[10px] text-ink-500">Profit zone starts at {result.breakEvenUnits} units sold</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-4 text-center">
            <p className="text-sm text-rose-200">Price must exceed variable cost per unit</p>
          </div>
        )
      }
    />
  );
}
