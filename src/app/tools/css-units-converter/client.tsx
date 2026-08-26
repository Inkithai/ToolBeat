"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

const UNITS = [
  { name: "px", label: "Pixels (px)", base: 1 },
  { name: "rem", label: "Rem (rem)", base: 16 },
  { name: "em", label: "Em (em)", base: 16 },
  { name: "pt", label: "Points (pt)", base: 16 / 12 },
  { name: "vh", label: "Viewport Height (vh)", base: 10.8 },
  { name: "vw", label: "Viewport Width (vw)", base: 19.2 },
  { name: "%", label: "Percent (%)", base: 16 },
];

export default function Client() {
  const [value, setValue] = useState(16);
  const [fromUnit, setFromUnit] = useState("px");
  const [rootFontSize, setRootFontSize] = useState(16);

  const conversions = useMemo(() => {
    const fromBase = UNITS.find(u => u.name === fromUnit)!.base;
    const px = value * fromBase;
    return UNITS.map(u => ({
      name: u.name,
      label: u.label,
      value: u.base === 0 ? 0 : +(px / (u.name === "rem" || u.name === "em" ? rootFontSize : u.base)).toFixed(4),
    }));
  }, [value, fromUnit, rootFontSize]);

  return (
    <IoWorkspace
      inputLabel="Value & unit"
      outputLabel="All conversions"
      status="complete"
      input={
        <div className="space-y-3">
          <div className="grid grid-cols-[3fr_2fr] gap-2">
            <input
              type="number"
              value={value}
              onChange={e => setValue(+e.target.value)}
              className="field w-full"
              step="any"
            />
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="field w-full">
              {UNITS.map(u => (
                <option key={u.name} value={u.name}>{u.label}</option>
              ))}
            </select>
          </div>
          <label className="space-y-1">
            <span className="text-xs text-ink-400">Root font size (for rem/em): {rootFontSize}px</span>
            <input type="number" value={rootFontSize} onChange={e => setRootFontSize(+e.target.value)} min={1} className="field w-full" />
          </label>
        </div>
      }
      output={
        <div className="space-y-2">
          {conversions.map(c => (
            <div key={c.name} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${c.name === fromUnit ? "border-indigo-400/20 bg-indigo-500/5" : "border-white/[0.06] bg-white/[0.02]"}`}>
              <span className="text-xs text-ink-400">{c.label}</span>
              <code className="font-mono text-sm font-bold text-white">{c.value} {c.name}</code>
            </div>
          ))}
        </div>
      }
    />
  );
}
