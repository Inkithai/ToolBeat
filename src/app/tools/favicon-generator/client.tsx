"use client";
import { useState, useRef, useCallback } from "react";
import { Download } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [text, setText] = useState("A"); const [bgColor, setBgColor] = useState("#6366f1"); const [textColor, setTextColor] = useState("#ffffff"); const [size, setSize] = useState(64); const [shape, setShape] = useState<"square"|"rounded"|"circle">("rounded");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    canvas.width = size; canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = bgColor;
    if (shape === "circle") { ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx.fill(); }
    else if (shape === "rounded") { const r = size * 0.2; ctx.beginPath(); ctx.roundRect(0, 0, size, size, r); ctx.fill(); }
    else { ctx.fillRect(0, 0, size, size); }
    ctx.fillStyle = textColor; ctx.font = `bold ${size*0.6}px system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text.slice(0, 2), size/2, size/2);
  }, [text, bgColor, textColor, size, shape]);
  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    draw();
    canvas.toBlob(blob => { if (!blob) return; const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `favicon-${size}x${size}.png`; a.click(); URL.revokeObjectURL(url); });
  };
  return (
    <IoWorkspace inputLabel="Favicon settings" outputLabel="Preview" status="complete"
      input={<div className="space-y-3">
        <label className="space-y-1"><span className="text-xs text-ink-400">Text (1-2 characters)</span><input type="text" value={text} onChange={e => setText(e.target.value.slice(0,2))} maxLength={2} className="field w-full text-center text-2xl" /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1"><span className="text-xs text-ink-400">Background</span><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent" /></label>
          <label className="space-y-1"><span className="text-xs text-ink-400">Text color</span><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent" /></label>
        </div>
        <label className="space-y-1"><span className="text-xs text-ink-400">Size: {size}px</span><input type="range" value={size} onChange={e => setSize(+e.target.value)} min={16} max={512} step={16} className="w-full accent-indigo-500" /></label>
        <div className="flex gap-2"><button type="button" onClick={() => setShape("square")} className={`rounded px-2 py-1 text-xs ${shape === "square" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400"}`}>Square</button><button type="button" onClick={() => setShape("rounded")} className={`rounded px-2 py-1 text-xs ${shape === "rounded" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400"}`}>Rounded</button><button type="button" onClick={() => setShape("circle")} className={`rounded px-2 py-1 text-xs ${shape === "circle" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400"}`}>Circle</button></div>
        <button type="button" onClick={download} className="btn-primary w-full"><Download className="mr-2 inline h-4 w-4" />Download PNG</button>
      </div>}
      output={<div className="flex min-h-[12rem] items-center justify-center space-x-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6"><div className="text-center"><p className="mb-2 text-xs text-ink-500">64px</p><canvas ref={canvasRef} width={64} height={64} className="border border-white/10 rounded" style={{ imageRendering: "pixelated" }} /></div></div>}
    />
  );
}
