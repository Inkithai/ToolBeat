"use client";
import { useState, useRef, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
function quantizeColors(imageData: ImageData, colorCount: number): string[] {
  const data = imageData.data; const buckets: Map<string, number> = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i] / 32) * 32; const g = Math.round(data[i+1] / 32) * 32; const b = Math.round(data[i+2] / 32) * 32;
    const key = `${r},${g},${b}`; buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  const sorted = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, colorCount).map(([key]) => { const [r,g,b] = key.split(",").map(Number); return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`; });
}
export default function Client() {
  const [colors, setColors] = useState<string[]>([]); const [count, setCount] = useState(8); const [error, setError] = useState(""); const [copied, setCopied] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleFile = useCallback((f: File | null) => {
    if (!f || !f.type.startsWith("image/")) { setError("Please select an image."); return; }
    setError("");
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!; const ctx = canvas.getContext("2d")!;
      const scale = Math.min(1, 200 / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = img.naturalWidth * scale; canvas.height = img.naturalHeight * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setColors(quantizeColors(imageData, count));
    };
    img.src = url;
  }, [count]);
  const copy = async (v: string) => { await navigator.clipboard.writeText(v); setCopied(v); setTimeout(() => setCopied(""), 2000); };
  return (
    <IoWorkspace inputLabel="Image" outputLabel="Dominant colors" status={colors.length > 0 ? "complete" : "idle"}
      input={<div className="space-y-3">
        <div className="rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
          <UploadCloud className="mx-auto mb-2 h-8 w-8 text-ink-500" /><p className="text-sm text-ink-400">Drop an image</p>
          <label className="mt-2 inline-block cursor-pointer rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-200 hover:text-white">Browse<input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} /></label>
        </div>
        <label className="space-y-1"><span className="text-xs text-ink-400">Number of colors: {count}</span><input type="range" value={count} onChange={e => setCount(+e.target.value)} min={3} max={16} className="w-full accent-indigo-500" /></label>
        <canvas ref={canvasRef} className="hidden" />
      </div>}
      output={<div className="space-y-3">
        {colors.length > 0 && <div className="flex h-16 overflow-hidden rounded-xl">{colors.map((c, i) => <div key={i} className="flex-1 cursor-pointer" style={{ backgroundColor: c }} onClick={() => copy(c)} title={c} />)}</div>}
        <div className="flex flex-wrap gap-2">{colors.map((c, i) => <button key={i} type="button" onClick={() => copy(c)} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 hover:border-indigo-400/30"><span className="h-5 w-5 rounded" style={{ backgroundColor: c }} /><code className="font-mono text-xs text-ink-200">{copied === c ? "✓" : c}</code></button>)}</div>
        {error && <p className="text-xs text-rose-300">{error}</p>}
      </div>}
    />
  );
}
