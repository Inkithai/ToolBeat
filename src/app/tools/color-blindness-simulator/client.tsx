"use client";
import { useState, useRef, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
type Deficiency = "normal" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
const MATRICES: Record<Deficiency, number[]> = {
  normal: [1,0,0, 0,1,0, 0,0,1],
  protanopia: [0.567,0.433,0, 0.558,0.442,0, 0,0.242,0.758],
  deuteranopia: [0.625,0.375,0, 0.7,0.3,0, 0,0.3,0.7],
  tritanopia: [0.95,0.05,0, 0,0.433,0.567, 0,0.475,0.525],
  achromatopsia: [0.299,0.587,0.114, 0.299,0.587,0.114, 0.299,0.587,0.114],
};
const DEFICIENCY_INFO: Record<Deficiency, string> = {
  normal: "Normal vision",
  protanopia: "Red-blind (~1% of males)",
  deuteranopia: "Green-blind (~1% of males)",
  tritanopia: "Blue-blind (~0.001%)",
  achromatopsia: "Total color blindness (very rare)",
};
export default function Client() {
  const [imgUrl, setImgUrl] = useState(""); const [deficiency, setDeficiency] = useState<Deficiency>("normal");
  const canvasRef = useRef<HTMLCanvasElement>(null); const imgRef = useRef<HTMLImageElement>(null);
  const handleFile = useCallback((f: File | null) => {
    if (!f || !f.type.startsWith("image/")) return;
    setImgUrl(URL.createObjectURL(f));
  }, []);
  const applyFilter = useCallback(() => {
    const canvas = canvasRef.current; const img = imgRef.current; if (!canvas || !img) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data; const m = MATRICES[deficiency];
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      data[i] = Math.min(255, m[0]*r + m[1]*g + m[2]*b);
      data[i+1] = Math.min(255, m[3]*r + m[4]*g + m[5]*b);
      data[i+2] = Math.min(255, m[6]*r + m[7]*g + m[8]*b);
    }
    ctx.putImageData(imageData, 0, 0);
  }, [deficiency]);
  return (
    <IoWorkspace inputLabel="Image" outputLabel="Simulated view" status={imgUrl ? "complete" : "idle"}
      input={<div className="space-y-3">
        <div className="rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
          <UploadCloud className="mx-auto mb-2 h-8 w-8 text-ink-500" /><p className="text-sm text-ink-400">Drop an image or</p>
          <label className="mt-2 inline-block cursor-pointer rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-200 hover:text-white">Browse<input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} /></label>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-ink-400">Color vision deficiency</p>
          {(Object.keys(MATRICES) as Deficiency[]).map(d => (
            <label key={d} className="flex items-center gap-2 text-xs text-ink-300"><input type="radio" name="deficiency" value={d} checked={deficiency === d} onChange={() => setDeficiency(d)} className="accent-indigo-500" />{DEFICIENCY_INFO[d]}</label>
          ))}
        </div>
      </div>}
      output={<div className="space-y-2">
        {imgUrl ? (
          <>
            <div className="overflow-hidden rounded-xl border border-white/10"><img ref={imgRef} src={imgUrl} alt="Source" onLoad={() => setTimeout(applyFilter, 100)} className="hidden" crossOrigin="anonymous" /><canvas ref={canvasRef} className="max-h-[14rem] w-full" /></div>
            <button type="button" onClick={applyFilter} className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-300 hover:text-white">Re-apply filter</button>
          </>
        ) : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Upload an image to simulate</div>}
      </div>}
    />
  );
}
