"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [dateStr, setDateStr] = useState("2026-08-26T14:30:00Z");
  const result = useMemo(() => {
    try {
      const d = new Date(dateStr); if (isNaN(d.getTime())) return null;
      const pad = (n: number) => String(n).padStart(2, "0");
      return [
        { format: "ISO 8601", value: d.toISOString() },
        { format: "UTC String", value: d.toUTCString() },
        { format: "Locale (en-US)", value: d.toLocaleString("en-US") },
        { format: "YYYY-MM-DD", value: `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}` },
        { format: "DD/MM/YYYY", value: `${pad(d.getUTCDate())}/${pad(d.getUTCMonth()+1)}/${d.getUTCFullYear()}` },
        { format: "MM/DD/YYYY", value: `${pad(d.getUTCMonth()+1)}/${pad(d.getUTCDate())}/${d.getUTCFullYear()}` },
        { format: "Unix (seconds)", value: String(Math.floor(d.getTime()/1000)) },
        { format: "Unix (ms)", value: String(d.getTime()) },
        { format: "RFC 2822", value: d.toUTCString() },
        { format: "Relative", value: (() => { const diff = Date.now() - d.getTime(); const days = Math.floor(diff/86400000); if (Math.abs(days) < 1) return "today"; if (days > 0) return `${days} days ago`; return `in ${-days} days`; })() },
      ];
    } catch { return null; }
  }, [dateStr]);
  return (
    <IoWorkspace inputLabel="Date input" outputLabel="All formats" status={result ? "complete" : "error"}
      input={<input type="text" value={dateStr} onChange={e => setDateStr(e.target.value)} className="field w-full font-mono text-xs" placeholder="Enter any date string..." />}
      output={result ? <div className="space-y-1.5">{result.map(r => <div key={r.format} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"><span className="text-xs text-ink-500">{r.format}</span><code className="font-mono text-xs font-bold text-white">{r.value}</code></div>)}</div> : <div className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-4 text-center text-sm text-rose-200">Invalid date</div>}
    />
  );
}
