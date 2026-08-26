"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [mode, setMode] = useState<"count" | "add">("count");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [daysToAdd, setDaysToAdd] = useState(30);
  const [includeWeekends, setIncludeWeekends] = useState(false);

  const countResult = useMemo(() => {
    if (mode !== "count" || !startDate || !endDate) return null;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    let businessDays = 0;
    let totalDays = 0;
    let weekends = 0;
    const current = new Date(start);

    while (current <= end) {
      totalDays++;
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        businessDays++;
      } else {
        weekends++;
      }
      current.setDate(current.getDate() + 1);
    }

    return { businessDays, totalDays, weekends, calendarWeeks: Math.floor(totalDays / 7) };
  }, [mode, startDate, endDate]);

  const addResult = useMemo(() => {
    if (mode !== "add" || !startDate) return null;
    const start = new Date(`${startDate}T00:00:00`);
    if (isNaN(start.getTime())) return null;

    let remaining = daysToAdd;
    const current = new Date(start);

    while (remaining > 0) {
      current.setDate(current.getDate() + 1);
      if (includeWeekends || (current.getDay() !== 0 && current.getDay() !== 6)) {
        remaining--;
      }
    }

    // Also calculate calendar days for comparison
    const calendarDays = Math.round((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return {
      resultDate: current.toISOString().split("T")[0],
      calendarDays,
      businessDays: daysToAdd,
    };
  }, [mode, startDate, daysToAdd, includeWeekends]);

  return (
    <IoWorkspace
      inputLabel="Date settings"
      outputLabel="Result"
      status={countResult || addResult ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("count")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "count" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400 hover:text-white"}`}
            >
              Count days
            </button>
            <button
              type="button"
              onClick={() => setMode("add")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "add" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400 hover:text-white"}`}
            >
              Add days
            </button>
          </div>
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Start date</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="field w-full" />
          </label>
          {mode === "count" ? (
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">End date</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="field w-full" />
            </label>
          ) : (
            <>
              <label className="space-y-1">
                <span className="text-xs font-medium text-ink-400">Business days to add</span>
                <input type="number" value={daysToAdd} onChange={e => setDaysToAdd(+e.target.value)} min={0} className="field w-full" />
              </label>
              <label className="flex items-center gap-2 text-xs text-ink-300">
                <input type="checkbox" checked={includeWeekends} onChange={e => setIncludeWeekends(e.target.checked)} className="rounded accent-indigo-500" />
                Include weekends
              </label>
            </>
          )}
        </div>
      }
      output={
        mode === "count" && countResult ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center">
              <p className="text-xs text-ink-500">Business days</p>
              <p className="text-4xl font-bold text-white">{countResult.businessDays}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-[10px] text-ink-500">Calendar days</p>
                <p className="font-mono text-lg font-bold text-white">{countResult.totalDays}</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-[10px] text-ink-500">Weekend days</p>
                <p className="font-mono text-lg font-bold text-ink-400">{countResult.weekends}</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-[10px] text-ink-500">Weeks</p>
                <p className="font-mono text-lg font-bold text-ink-400">{countResult.calendarWeeks}</p>
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]">
              <div className="h-full bg-indigo-500" style={{ width: `${(countResult.businessDays / countResult.totalDays) * 100}%` }} />
              <div className="h-full bg-ink-700" style={{ width: `${(countResult.weekends / countResult.totalDays) * 100}%` }} />
            </div>
            <p className="text-center text-[10px] text-ink-500">
              <span className="inline-block h-2 w-2 rounded-sm bg-indigo-500 mr-1" />Business days ({((countResult.businessDays / countResult.totalDays) * 100).toFixed(0)}%)
              <span className="ml-3 inline-block h-2 w-2 rounded-sm bg-ink-700 mr-1" />Weekends ({((countResult.weekends / countResult.totalDays) * 100).toFixed(0)}%)
            </p>
          </div>
        ) : mode === "add" && addResult ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center">
              <p className="text-xs text-ink-500">Result date</p>
              <p className="text-3xl font-bold text-white">{addResult.resultDate}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-[10px] text-ink-500">Business days added</p>
                <p className="font-mono text-lg font-bold text-indigo-300">{addResult.businessDays}</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-[10px] text-ink-500">Calendar days elapsed</p>
                <p className="font-mono text-lg font-bold text-white">{addResult.calendarDays}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            Enter dates to calculate
          </div>
        )
      }
    />
  );
}
