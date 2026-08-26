"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [px, setPx] = useState(16); const [rootSize, setRootSize] = useState(16);
  const conversions = useMemo(() => [
    { unit: "px", value: px, label: "Pixels" },
    { unit: "pt", value: px * 0.75, label: "Points (print)" },
    { unit: "rem", value: px / rootSize, label: "Rem (root em)" },
    { unit: "em", value: px / rootSize, label: "Em (relative)" },
    { unit: "%", value: (px / rootSize) * 100, label: "Percent of root" },
    { unit: "vw", value: (px / 1920) * 100, label: "Viewport width (1920)" },
    { unit: "vh", value: (px / 1080) * 100, label: "Viewport height (1080)" },
  ], [px, rootSize]);
  return (
    <IoWorkspace inputLabel="Font size" outputLabel="All units" status="complete"
      input={<div className="space-y-3">
        <label className="space-y-1"><span className="text-xs text-ink-400">Size in pixels</span><input type="number" value={px} onChange={e => setPx(+e.target.value)} min={1} className="field w-full text-2xl" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Root font size (default 16px)</span><input type="number" value={rootSize} onChange={e => setRootSize(+e.target.value)} min={1} className="field w-full" /></label>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"><p style={{ fontSize: `${px}px` }} className="text-white">Preview at {px}px</p></div>
      </div>}
      output={<div className="space-y-1.5">{conversions.map(c => <div key={c.unit} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"><span className="text-xs text-ink-400">{c.label} ({c.unit})</span><code className="font-mono text-sm font-bold text-white">{c.value.toFixed(4)}{c.unit !== "%" ? c.unit : "%"}</code></div>)}</div>}
    />
  );
}
