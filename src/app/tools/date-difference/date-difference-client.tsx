"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, CalendarDays } from "lucide-react";
import { diffDates, parseDateInput } from "@/lib/tools/date-difference";

const today = () => new Date().toISOString().slice(0, 10);

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

/** Days between calendar "same day next week" examples read best in words. */
function breakdownText(years: number, months: number, days: number): string {
  const parts: string[] = [];
  if (years) parts.push(`${numberFormat.format(years)} year${years === 1 ? "" : "s"}`);
  if (months) parts.push(`${numberFormat.format(months)} month${months === 1 ? "" : "s"}`);
  if (days || parts.length === 0) parts.push(`${numberFormat.format(days)} day${days === 1 ? "" : "s"}`);
  return parts.join(", ");
}

export default function DateDifferenceClient() {
  // Defaults show "this year so far", the most common question.
  const [start, setStart] = useState(`${new Date().getFullYear()}-01-01`);
  const [end, setEnd] = useState(today);

  const result = useMemo(() => {
    if (!start || !end) return { status: "empty" as const };
    try {
      return { status: "ok" as const, diff: diffDates(parseDateInput(start, "start date"), parseDateInput(end, "end date")) };
    } catch (caught: unknown) {
      return { status: "error" as const, message: caught instanceof Error ? caught.message : "Could not read those dates." };
    }
  }, [start, end]);

  const swap = () => {
    setStart(end);
    setEnd(start);
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2" aria-label="Pick two dates">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink-200">Start date</span>
          <input
            type="date"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-navy-900 px-4 py-3 font-mono text-sm text-white outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15"
          />
        </label>
        <div className="flex items-end gap-2">
          <label className="block flex-1">
            <span className="mb-1.5 block text-xs font-semibold text-ink-200">End date</span>
            <input
              type="date"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-navy-900 px-4 py-3 font-mono text-sm text-white outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15"
            />
          </label>
          <button
            type="button"
            onClick={swap}
            className="mb-0.5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm font-semibold text-ink-100 transition-colors hover:border-cyan-400/30 hover:bg-white/10"
            aria-label="Swap start and end dates"
          >
            <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      {result.status === "error" && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {result.message}
        </p>
      )}

      {result.status === "ok" && !result.diff.startBeforeEnd && (
        <p role="status" className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          The end date is before the start date — showing the difference in the other direction.
        </p>
      )}

      {result.status === "ok" && (
        <>
          <section
            className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 px-6 py-8 text-center"
            aria-live="polite"
          >
            <p className="font-mono text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {numberFormat.format(result.diff.totalDays)}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink-100">total days (inclusive of both ends)</p>
            <p className="mt-2 text-sm text-ink-200">
              {breakdownText(result.diff.years, result.diff.months, result.diff.days)}
            </p>
          </section>

          <section className="grid gap-3 sm:grid-cols-3" aria-label="Breakdown">
            <Stat
              icon={<CalendarDays className="h-4 w-4 text-cyan-400" aria-hidden="true" />}
              label="Weeks"
              value={`${numberFormat.format(result.diff.weeks)} weeks, ${result.diff.weekRemainderDays} days`}
            />
            <Stat
              icon={<CalendarDays className="h-4 w-4 text-emerald-400" aria-hidden="true" />}
              label="Weekdays (Mon–Fri)"
              value={numberFormat.format(result.diff.weekdays)}
            />
            <Stat
              icon={<CalendarDays className="h-4 w-4 text-violet-400" aria-hidden="true" />}
              label="Weekend days"
              value={numberFormat.format(result.diff.weekendDays)}
            />
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {icon} {label}
      </p>
      <p className="mt-1 font-mono text-lg font-bold text-white">{value}</p>
    </div>
  );
}
