"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
const UNITS = ["B","KB","MB","GB","TB","PB","EB"];
export default function Client() {
  const [value, setValue] = useState(1); const [fromUnit, setFromUnit] = useState("GB");
  const conversions = useMemo(() => {
    const bytes = value * Math.pow(1024, UNITS.indexOf(fromUnit));
    return UNITS.map(u => ({ unit: u, value: bytes / Math.pow(1024, UNITS.indexOf(u)) }));
  }, [value, fromUnit]);
  return (
    <IoWorkspace inputLabel="Value" outputLabel="All conversions" status="complete"
      input={<div className="grid grid-cols-[3fr_2fr] gap-2"><input type="number" value={value} onChange={e => setValue(+e.target.value)} step="any" className="field w-full" /><select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="field w-full">{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>}
      output={<div className="space-y-1.5">{conversions.map(c => <div key={c.unit} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${c.unit === fromUnit ? "border-indigo-400/20 bg-indigo-500/5" : "border-white/[0.06] bg-white/[0.02]"}`}><span className="text-xs text-ink-400">{c.unit}</span><code className="font-mono text-sm font-bold text-white">{c.value.toLocaleString(undefined, { maximumFractionDigits: 6 })}</code></div>)}</div>}
    />
  );
}
