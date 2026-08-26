"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
function luminance(hex: string): number {
  const rgb = hex.replace("#","").match(/.{2}/g)!.map(h => { const c = parseInt(h,16)/255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); });
  return 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2];
}
function contrast(fg: string, bg: string): number {
  const l1 = luminance(fg); const l2 = luminance(bg);
  const lighter = Math.max(l1, l2); const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
export default function Client() {
  const [fg, setFg] = useState("#1e293b"); const [bg, setBg] = useState("#ffffff");
  const result = useMemo(() => {
    try {
      const ratio = contrast(fg, bg);
      const aaNormal = ratio >= 4.5; const aaLarge = ratio >= 3; const aaaNormal = ratio >= 7; const aaaLarge = ratio >= 4.5;
      return { ratio: ratio.toFixed(2), aaNormal, aaLarge, aaaNormal, aaaLarge };
    } catch { return null; }
  }, [fg, bg]);
  if (!result) return null;
  return (
    <IoWorkspace inputLabel="Colors" outputLabel="WCAG results" status="complete"
      input={<div className="space-y-3">
        <div className="rounded-xl border border-white/10 p-4 text-center" style={{ backgroundColor: bg }}><p style={{ color: fg }} className="text-2xl font-bold">Sample Text</p><p style={{ color: fg }} className="text-sm">Body text at 14px</p></div>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1"><span className="text-xs text-ink-400">Foreground</span><div className="flex items-center gap-2"><input type="color" value={fg} onChange={e => setFg(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent" /><input type="text" value={fg} onChange={e => setFg(e.target.value)} className="field flex-1 font-mono text-xs" /></div></label>
          <label className="space-y-1"><span className="text-xs text-ink-400">Background</span><div className="flex items-center gap-2"><input type="color" value={bg} onChange={e => setBg(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent" /><input type="text" value={bg} onChange={e => setBg(e.target.value)} className="field flex-1 font-mono text-xs" /></div></label>
        </div>
      </div>}
      output={<div className="space-y-3">
        <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center"><p className="text-xs text-ink-500">Contrast ratio</p><p className="text-4xl font-bold text-white">{result.ratio}:1</p></div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-lg border p-3 text-center ${result.aaNormal ? "border-emerald-400/20 bg-emerald-500/5" : "border-rose-400/20 bg-rose-500/5"}`}><p className="text-[10px] text-ink-500">AA Normal</p><p className="text-lg font-bold">{result.aaNormal ? "✓ Pass" : "✗ Fail"}</p></div>
          <div className={`rounded-lg border p-3 text-center ${result.aaLarge ? "border-emerald-400/20 bg-emerald-500/5" : "border-rose-400/20 bg-rose-500/5"}`}><p className="text-[10px] text-ink-500">AA Large</p><p className="text-lg font-bold">{result.aaLarge ? "✓ Pass" : "✗ Fail"}</p></div>
          <div className={`rounded-lg border p-3 text-center ${result.aaaNormal ? "border-emerald-400/20 bg-emerald-500/5" : "border-rose-400/20 bg-rose-500/5"}`}><p className="text-[10px] text-ink-500">AAA Normal</p><p className="text-lg font-bold">{result.aaaNormal ? "✓ Pass" : "✗ Fail"}</p></div>
          <div className={`rounded-lg border p-3 text-center ${result.aaaLarge ? "border-emerald-400/20 bg-emerald-500/5" : "border-rose-400/20 bg-rose-500/5"}`}><p className="text-[10px] text-ink-500">AAA Large</p><p className="text-lg font-bold">{result.aaaLarge ? "✓ Pass" : "✗ Fail"}</p></div>
        </div>
      </div>}
    />
  );
}
