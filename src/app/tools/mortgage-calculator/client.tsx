"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

type AmortRow = { month: number; payment: number; principal: number; interest: number; balance: number };

export default function Client() {
  const [principal, setPrincipal] = useState(300000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [extra, setExtra] = useState(0);

  const result = useMemo(() => {
    if (principal <= 0 || rate < 0 || years <= 0) return null;
    const monthlyRate = rate / 100 / 12;
    const totalPayments = years * 12;
    let monthly: number;

    if (monthlyRate === 0) {
      monthly = principal / totalPayments;
    } else {
      monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }

    const schedule: AmortRow[] = [];
    let balance = principal;
    let totalInterest = 0;
    let totalPaid = 0;

    for (let i = 1; i <= totalPayments && balance > 0; i++) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = monthly - interestPayment + extra;
      if (principalPayment > balance) principalPayment = balance;
      balance -= principalPayment;
      totalInterest += interestPayment;
      totalPaid += principalPayment + interestPayment;

      schedule.push({
        month: i,
        payment: principalPayment + interestPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
      });
    }

    return { monthly: monthly + extra, totalPaid, totalInterest, schedule };
  }, [principal, rate, years, extra]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const fmtShort = (n: number) => `$${(n / 1000).toFixed(0)}k`;

  return (
    <IoWorkspace
      inputLabel="Mortgage details"
      outputLabel="Monthly payment & schedule"
      status={result ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Loan amount ($)</span>
            <input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} min={0} step={1000} className="field w-full" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Annual interest rate (%)</span>
            <input type="number" value={rate} onChange={e => setRate(+e.target.value)} min={0} max={30} step={0.1} className="field w-full" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Loan term (years)</span>
            <input type="number" value={years} onChange={e => setYears(+e.target.value)} min={1} max={50} className="field w-full" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Extra monthly payment ($)</span>
            <input type="number" value={extra} onChange={e => setExtra(+e.target.value)} min={0} step={50} className="field w-full" />
          </label>
        </div>
      }
      output={
        result ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center">
                <p className="text-xs text-ink-500">Monthly Payment</p>
                <p className="text-2xl font-bold text-white">{fmt(result.monthly)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <p className="text-xs text-ink-500">Total Interest</p>
                <p className="text-2xl font-bold text-rose-300">{fmt(result.totalInterest)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <p className="text-xs text-ink-500">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-300">{fmt(result.totalPaid)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <p className="text-xs text-ink-500">Payoff in</p>
                <p className="text-2xl font-bold text-white">{Math.ceil(result.schedule.length / 12)} years</p>
              </div>
            </div>
            {/* Visual bar showing principal vs interest */}
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="mb-1 flex justify-between text-[10px] text-ink-500">
                <span>Principal: {fmt(principal)}</span>
                <span>Interest: {fmt(result.totalInterest)}</span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full">
                <div className="bg-emerald-500" style={{ width: `${(principal / result.totalPaid) * 100}%` }} />
                <div className="bg-rose-500" style={{ width: `${(result.totalInterest / result.totalPaid) * 100}%` }} />
              </div>
            </div>
            {/* Yearly summary table */}
            <div className="max-h-40 overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-navy-900">
                  <tr className="text-ink-500">
                    <th className="px-2 py-1.5 text-left">Year</th>
                    <th className="px-2 py-1.5 text-right">Paid</th>
                    <th className="px-2 py-1.5 text-right">Principal</th>
                    <th className="px-2 py-1.5 text-right">Interest</th>
                    <th className="px-2 py-1.5 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.ceil(result.schedule.length / 12) }, (_, yi) => {
                    const yearRows = result.schedule.slice(yi * 12, (yi + 1) * 12);
                    const yearPrincipal = yearRows.reduce((a, r) => a + r.principal, 0);
                    const yearInterest = yearRows.reduce((a, r) => a + r.interest, 0);
                    const lastBalance = yearRows[yearRows.length - 1]?.balance ?? 0;
                    return (
                      <tr key={yi} className="border-t border-white/[0.04]">
                        <td className="px-2 py-1 text-ink-300">Year {yi + 1}</td>
                        <td className="px-2 py-1 text-right text-ink-200">{fmtShort(yearPrincipal + yearInterest)}</td>
                        <td className="px-2 py-1 text-right text-emerald-400">{fmtShort(yearPrincipal)}</td>
                        <td className="px-2 py-1 text-right text-rose-400">{fmtShort(yearInterest)}</td>
                        <td className="px-2 py-1 text-right text-ink-300">{fmtShort(lastBalance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            Enter loan details to calculate
          </div>
        )
      }
    />
  );
}
