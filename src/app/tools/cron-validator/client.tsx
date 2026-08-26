"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
function validateCronField(field: string, min: number, max: number): { valid: boolean; error: string } {
  if (field === "*") return { valid: true, error: "" };
  if (/^\*\/\d+$/.test(field)) { const n = parseInt(field.split("/")[1]); if (n < 1 || n > max) return { valid: false, error: `Step ${n} out of range (${min}-${max})` }; return { valid: true, error: "" }; }
  if (/^\d+$/.test(field)) { const n = parseInt(field); if (n < min || n > max) return { valid: false, error: `${n} out of range (${min}-${max})` }; return { valid: true, error: "" }; }
  if (/^\d+-\d+$/.test(field)) { const [a, b] = field.split("-").map(Number); if (a < min || b > max || a > b) return { valid: false, error: `Range ${a}-${b} invalid (${min}-${max})` }; return { valid: true, error: "" }; }
  if (/^[\d,]+$/.test(field)) { const parts = field.split(",").map(Number); if (parts.some(n => n < min || n > max)) return { valid: false, error: `Value out of range (${min}-${max})` }; return { valid: true, error: "" }; }
  return { valid: false, error: `Invalid expression: ${field}` };
}
export default function Client() {
  const [cron, setCron] = useState("*/5 * * * *");
  const result = useMemo(() => {
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) return { valid: false, errors: [`Expected 5 fields, got ${parts.length}`], fields: [] };
    const fields = [
      { name: "Minute", value: parts[0], min: 0, max: 59 },
      { name: "Hour", value: parts[1], min: 0, max: 23 },
      { name: "Day (month)", value: parts[2], min: 1, max: 31 },
      { name: "Month", value: parts[3], min: 1, max: 12 },
      { name: "Day (week)", value: parts[4], min: 0, max: 7 },
    ];
    const errors: string[] = [];
    const validated = fields.map(f => { const r = validateCronField(f.value, f.min, f.max); if (!r.valid) errors.push(`${f.name}: ${r.error}`); return { ...f, ...r }; });
    return { valid: errors.length === 0, errors, fields: validated };
  }, [cron]);
  return (
    <IoWorkspace inputLabel="Cron expression" outputLabel="Validation" status={result.valid ? "complete" : "error"}
      input={<input type="text" value={cron} onChange={e => setCron(e.target.value)} className="field w-full font-mono text-2xl text-center" placeholder="* * * * *" />}
      output={result.valid ? <div className="space-y-3">
        <div className="flex items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4"><span className="text-2xl font-bold text-emerald-300">✓ Valid cron expression</span></div>
        <div className="space-y-1.5">{result.fields.map((f, i) => <div key={i} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"><span className="text-xs text-ink-400">{f.name}</span><code className="font-mono text-sm text-emerald-300">{f.value}</code></div>)}</div>
      </div> : <div className="space-y-2"><div className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-center"><span className="text-lg font-bold text-rose-300">✗ Invalid</span></div>{result.errors.map((e, i) => <p key={i} className="text-xs text-rose-300">• {e}</p>)}</div>}
    />
  );
}
