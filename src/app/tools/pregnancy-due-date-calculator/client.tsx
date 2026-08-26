"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [lmp, setLmp] = useState(""); const [cycleLength, setCycleLength] = useState(28);
  const result = useMemo(() => {
    if (!lmp) return null;
    const lmpDate = new Date(`${lmp}T00:00:00`); if (isNaN(lmpDate.getTime())) return null;
    const dueDate = new Date(lmpDate); dueDate.setDate(dueDate.getDate() + 280 + (cycleLength - 28));
    const now = new Date(); const diff = now.getTime() - lmpDate.getTime(); const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7); const extraDays = days % 7;
    const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;
    const conception = new Date(lmpDate); conception.setDate(conception.getDate() + 14);
    return { dueDate, weeks, extraDays, trimester, conception, daysPregnant: days > 0 ? days : 0 };
  }, [lmp, cycleLength]);
  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return (
    <IoWorkspace inputLabel="Last menstrual period" outputLabel="Due date & timeline" status={result ? "complete" : "idle"}
      input={<div className="space-y-3">
        <label className="space-y-1"><span className="text-xs text-ink-400">First day of LMP</span><input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className="field w-full" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Average cycle length (days)</span><input type="number" value={cycleLength} onChange={e => setCycleLength(+e.target.value)} min={20} max={45} className="field w-full" /></label>
      </div>}
      output={result ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-pink-400/20 bg-pink-500/5 p-4 text-center"><p className="text-xs text-ink-500">Estimated due date</p><p className="text-xl font-bold text-white">{fmtDate(result.dueDate)}</p></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center"><p className="text-[10px] text-ink-500">Current week</p><p className="text-2xl font-bold text-white">{result.weeks}w {result.extraDays}d</p></div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center"><p className="text-[10px] text-ink-500">Trimester</p><p className="text-2xl font-bold text-pink-300">{result.trimester} of 3</p></div>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-ink-400">Estimated conception: <strong className="text-white">{fmtDate(result.conception)}</strong></div>
        </div>
      ) : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Enter LMP date</div>}
    />
  );
}
