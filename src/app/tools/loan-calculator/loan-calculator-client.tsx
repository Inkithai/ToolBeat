"use client";

import { useMemo, useState } from "react";
import { amortizationByYear, formatMoney, loanSummary, type LoanTerms } from "@/lib/tools/loan";

function ResultCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="meta text-ink-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export default function LoanCalculatorClient() {
  const [principal, setPrincipal] = useState(250000);
  const [annualRatePct, setAnnualRatePct] = useState(6.5);
  const [years, setYears] = useState(30);

  const summary = useMemo(() => {
    try {
      return { terms: { principal, annualRatePct, years } as LoanTerms, error: "", data: loanSummary({ principal, annualRatePct, years }) };
    } catch (caught) {
      return { terms: null, error: caught instanceof Error ? caught.message : "Invalid terms.", data: null };
    }
  }, [principal, annualRatePct, years]);

  const schedule = useMemo(() => {
    if (!summary.data) return [];
    try {
      return amortizationByYear(summary.terms as LoanTerms);
    } catch {
      return [];
    }
  }, [summary]);

  const field = "w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/50";

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Loan amount</span>
          <input
            type="number"
            min={0}
            step={1000}
            value={Number.isFinite(principal) ? principal : ""}
            onChange={(event) => setPrincipal(Number(event.target.value))}
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Annual interest rate (%)</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={Number.isFinite(annualRatePct) ? annualRatePct : ""}
            onChange={(event) => setAnnualRatePct(Number(event.target.value))}
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Term (years)</span>
          <input
            type="number"
            min={1}
            max={50}
            step={0.5}
            value={Number.isFinite(years) ? years : ""}
            onChange={(event) => setYears(Number(event.target.value))}
            className={field}
          />
        </label>
      </div>

      {summary.error ? (
        <p className="mt-4 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
          {summary.error}
        </p>
      ) : (
        summary.data && (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Monthly payment"
                value={`$${formatMoney(summary.data.monthlyPayment)}`}
                hint={`over ${summary.data.months} monthly payments`}
              />
              <ResultCard
                label="Total interest"
                value={`$${formatMoney(summary.data.totalInterest)}`}
                hint={`${Math.round(summary.data.interestShare * 100)}% of everything you pay`}
              />
              <ResultCard
                label="Total repaid"
                value={`$${formatMoney(summary.data.totalPaid)}`}
                hint={`on a $${formatMoney((summary.terms as LoanTerms).principal)} principal`}
              />
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-sm font-bold text-white">Year-by-year</h3>
              <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-ink-500">
                      <th className="px-4 py-2.5 font-semibold">Year</th>
                      <th className="px-4 py-2.5 font-semibold">Paid</th>
                      <th className="px-4 py-2.5 font-semibold">Interest</th>
                      <th className="px-4 py-2.5 font-semibold">Principal</th>
                      <th className="px-4 py-2.5 font-semibold">Balance after</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.year} className="border-b border-white/[0.05] last:border-0">
                        <td className="px-4 py-2.5 font-semibold text-ink-200">{row.year}</td>
                        <td className="px-4 py-2.5 text-ink-300">${formatMoney(row.paidThisYear)}</td>
                        <td className="px-4 py-2.5 text-ink-300">${formatMoney(row.interestThisYear)}</td>
                        <td className="px-4 py-2.5 text-ink-300">${formatMoney(row.principalThisYear)}</td>
                        <td className="px-4 py-2.5 text-ink-200">${formatMoney(row.balanceAfter)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-ink-600">
                Standard amortizing schedule at a fixed rate, compounded monthly. For estimates only — not financial advice.
              </p>
            </div>
          </>
        )
      )}
    </div>
  );
}
