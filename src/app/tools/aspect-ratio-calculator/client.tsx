"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }

export default function Client() {
  const [mode, setMode] = useState<"ratio" | "scale">("ratio");
  const [w, setW] = useState(1920); const [h, setH] = useState(1080);
  const [ratioW, setRatioW] = useState(16); const [ratioH, setRatioH] = useState(9); const [knownDim, setKnownDim] = useState(1920);

  const ratioResult = useMemo(() => { const g = gcd(Math.abs(w), Math.abs(h)); return { rw: w/g, rh: h/g, ratio: `${w/g}:${h/g}`, decimal: (w/h).toFixed(4) }; }, [w, h]);
  const scaleResult = useMemo(() => { const scaledH = (knownDim / ratioW) * ratioH; return { scaledW: knownDim, scaledH: Math.round(scaledH) }; }, [knownDim, ratioW, ratioH]);

  return (
    <IoWorkspace inputLabel="Dimensions" outputLabel="Result" status="complete"
      input={<div className="space-y-3">
        <div className="flex gap-2"><button type="button" onClick={() => setMode("ratio")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === "ratio" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400"}`}>Find ratio</button><button type="button" onClick={() => setMode("scale")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === "scale" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400"}`}>Scale to ratio</button></div>
        {mode === "ratio" ? (
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1"><span className="text-xs text-ink-400">Width</span><input type="number" value={w} onChange={e => setW(+e.target.value)} className="field w-full" /></label>
            <label className="space-y-1"><span className="text-xs text-ink-400">Height</span><input type="number" value={h} onChange={e => setH(+e.target.value)} className="field w-full" /></label>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1"><span className="text-xs text-ink-400">Ratio W</span><input type="number" value={ratioW} onChange={e => setRatioW(+e.target.value)} className="field w-full" /></label>
              <label className="space-y-1"><span className="text-xs text-ink-400">Ratio H</span><input type="number" value={ratioH} onChange={e => setRatioH(+e.target.value)} className="field w-full" /></label>
            </div>
            <label className="space-y-1"><span className="text-xs text-ink-400">Known dimension (width)</span><input type="number" value={knownDim} onChange={e => setKnownDim(+e.target.value)} className="field w-full" /></label>
          </div>
        )}
      </div>}
      output={mode === "ratio" ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center"><p className="text-xs text-ink-500">Aspect ratio</p><p className="text-4xl font-bold text-white">{ratioResult.ratio}</p><p className="mt-1 text-xs text-ink-400">{ratioResult.decimal} : 1</p></div>
          <div className="h-32 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center"><div className="bg-indigo-500/30 border-2 border-indigo-400/50" style={{ width: `${Math.min(100, (w/h)*80)}%`, height: `${Math.min(100, 80)}` }} /></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center"><p className="text-xs text-ink-500">Width</p><p className="text-3xl font-bold text-white">{scaleResult.scaledW}</p></div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"><p className="text-xs text-ink-500">Height</p><p className="text-3xl font-bold text-white">{scaleResult.scaledH}</p></div>
          </div>
          <p className="text-center text-xs text-ink-500">Ratio {ratioW}:{ratioH}</p>
        </div>
      )}
    />
  );
}
