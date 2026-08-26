"use client";
import { useState, useEffect } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
const BREAKPOINTS = [{ name: "Mobile (S)", max: 320 }, { name: "Mobile (M)", max: 375 }, { name: "Mobile (L)", max: 425 }, { name: "Tablet", max: 768 }, { name: "Laptop", max: 1024 }, { name: "Laptop (L)", max: 1440 }, { name: "Desktop", max: 1920 }, { name: "Desktop (4K)", max: 2560 }];
export default function Client() {
  const [size, setSize] = useState({ w: 0, h: 0 }); const [dpr, setDpr] = useState(1); const [orientation, setOrientation] = useState("");
  useEffect(() => {
    const update = () => { setSize({ w: window.innerWidth, h: window.innerHeight }); setDpr(window.devicePixelRatio); setOrientation(window.innerWidth > window.innerHeight ? "Landscape" : "Portrait"); };
    update(); window.addEventListener("resize", update); return () => window.removeEventListener("resize", update);
  }, []);
  const current = BREAKPOINTS.find(b => size.w <= b.max)?.name || "Ultra-wide";
  return (
    <IoWorkspace inputLabel="Your screen" outputLabel="Resolution info" status="complete"
      input={<div className="space-y-3">
        <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center"><p className="text-3xl font-bold text-white">{size.w} × {size.h}</p><p className="text-xs text-ink-400">{orientation}</p></div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center"><p className="text-[10px] text-ink-500">Device pixel ratio</p><p className="text-sm font-bold text-white">{dpr}x</p></div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center"><p className="text-[10px] text-ink-500">Category</p><p className="text-sm font-bold text-white">{current}</p></div>
        </div>
        <p className="text-[10px] text-ink-500">Resize your browser to see the values change</p>
      </div>}
      output={<div className="space-y-1.5">{BREAKPOINTS.map(b => <div key={b.name} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${size.w <= b.max && current === b.name ? "border-indigo-400/30 bg-indigo-500/10" : "border-white/[0.06] bg-white/[0.02]"}`}><span className="text-xs text-ink-300">{b.name}</span><span className="text-xs text-ink-500">≤ {b.max}px</span></div>)}</div>}
    />
  );
}
