"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
const PATTERNS = [
  { pattern: /(\b(union\s+(all\s+)?select|select\s+.*\s+from)\b)/gi, name: "UNION/SELECT injection", severity: "critical" },
  { pattern: /(\b(or|and)\s+\d+\s*=\s*\d+|'\s*(or|and)\s+'[^']*'\s*=\s*'[^']*')/gi, name: "Boolean-based injection", severity: "high" },
  { pattern: /(';\s*(drop|delete|insert|update|alter|create|exec)\b)/gi, name: "Stacked queries", severity: "critical" },
  { pattern: /(\b(sleep|benchmark|waitfor|pg_sleep)\s*\()/gi, name: "Time-based blind injection", severity: "high" },
  { pattern: /(--|#|\/\*[\s\S]*?\*\/)/g, name: "SQL comment", severity: "low" },
  { pattern: /(\bchar\s*\(\s*\d+\s*(,\s*\d+\s*)*\))/gi, name: "CHAR() encoding evasion", severity: "medium" },
  { pattern: /(0x[0-9a-fA-F]+)/g, name: "Hex encoding", severity: "low" },
  { pattern: /(\b(concat|group_concat|load_file|into\s+outfile|into\s+dumpfile)\s*\()/gi, name: "Data exfiltration functions", severity: "critical" },
];
export default function Client() {
  const [input, setInput] = useState("1' OR '1'='1' --");
  const findings = useMemo(() => {
    const found: { name: string; severity: string; matches: string[] }[] = [];
    for (const p of PATTERNS) { const matches = input.match(p.pattern); if (matches) found.push({ name: p.name, severity: p.severity, matches: [...new Set(matches)] }); }
    return found;
  }, [input]);
  const highest = findings.length > 0 ? findings.reduce((a, b) => ["low","medium","high","critical"].indexOf(b.severity) > ["low","medium","high","critical"].indexOf(a.severity) ? b : a) : null;
  const sevColor = (s: string) => s === "critical" ? "bg-rose-500/20 text-rose-300" : s === "high" ? "bg-orange-500/20 text-orange-300" : s === "medium" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300";
  return (
    <IoWorkspace inputLabel="SQL input to check" outputLabel="Injection patterns" status={findings.length > 0 ? "complete" : "idle"}
      input={<div className="space-y-3"><textarea value={input} onChange={e => setInput(e.target.value)} rows={6} spellCheck={false} className="field w-full font-mono text-xs" placeholder="Paste SQL query or user input here..." /><p className="text-[10px] text-ink-500">Checks for {PATTERNS.length} common SQL injection patterns. All analysis is local.</p></div>}
      output={<div className="space-y-3">
        {highest && <div className={`rounded-lg border ${highest.severity === "critical" ? "border-rose-400/20 bg-rose-500/10" : highest.severity === "high" ? "border-orange-400/20 bg-orange-500/10" : "border-amber-400/20 bg-amber-500/10"} p-3 text-center`}><p className="text-xs text-ink-400">Highest risk</p><p className={`text-2xl font-bold capitalize ${sevColor(highest.severity)} inline-block px-2 py-0.5 rounded`}>{highest.severity}</p></div>}
        {findings.length === 0 && <div className="flex min-h-[8rem] items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/5 text-sm text-emerald-300">✓ No injection patterns detected</div>}
        {findings.map((f, i) => <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"><div className="flex items-center justify-between mb-1"><span className="text-xs font-bold text-white">{f.name}</span><span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${sevColor(f.severity)}`}>{f.severity}</span></div><code className="font-mono text-[10px] text-ink-400">{f.matches.join(", ")}</code></div>)}
      </div>}
    />
  );
}
