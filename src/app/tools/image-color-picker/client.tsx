"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

type PickedColor = { hex: string; rgb: string; x: number; y: number };

export default function Client() {
  const [imageUrl, setImageUrl] = useState("");
  const [pickedColors, setPickedColors] = useState<PickedColor[]>([]);
  const [hoverColor, setHoverColor] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { return; }
    const url = URL.createObjectURL(f);
    setImageUrl(url);
    setPickedColors([]);
  }, []);

  const getImageData = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return null;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return { r: pixel[0], g: pixel[1], b: pixel[2], x, y };
  };

  const rgbToHex = (r: number, g: number, b: number) =>
    "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const data = getImageData(e);
    if (!data) return;
    const hex = rgbToHex(data.r, data.g, data.b);
    const rgb = `rgb(${data.r}, ${data.g}, ${data.b})`;
    setPickedColors(prev => [...prev, { hex, rgb, x: data.x, y: data.y }]);
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const data = getImageData(e);
    if (data) setHoverColor(rgbToHex(data.r, data.g, data.b));
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  };

  // Draw image on canvas when loaded
  const onImageLoad = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(img, 0, 0);
  };

  return (
    <IoWorkspace
      inputLabel="Image"
      outputLabel="Picked colors"
      status={pickedColors.length > 0 ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <div
            className="rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          >
            <UploadCloud className="mx-auto mb-2 h-8 w-8 text-ink-500" />
            <p className="text-sm text-ink-400">Drop an image or</p>
            <label className="mt-2 inline-block cursor-pointer rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-200 hover:text-white">
              Browse
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          {imageUrl && (
            <p className="text-xs text-ink-500">
              Click anywhere on the image to pick a color.
              {hoverColor && <span className="ml-2">Cursor: <strong className="text-white">{hoverColor}</strong></span>}
            </p>
          )}
        </div>
      }
      output={
        <div className="space-y-3">
          {imageUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-white/10">
              <img ref={imgRef} src={imageUrl} alt="Source" onLoad={onImageLoad} className="hidden" crossOrigin="anonymous" />
              <canvas
                ref={canvasRef}
                className="max-h-[16rem] w-full cursor-crosshair"
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMove}
              />
            </div>
          ) : (
            <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
              Upload an image to pick colors
            </div>
          )}
          {pickedColors.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-ink-500">Picked colors ({pickedColors.length})</p>
              <div className="flex flex-wrap gap-2">
                {pickedColors.map((color, i) => (
                  <div key={i} className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
                    <span className="h-6 w-6 rounded-md border border-white/10" style={{ backgroundColor: color.hex }} />
                    <div className="text-xs">
                      <code className="font-mono text-ink-200">{color.hex}</code>
                      <p className="text-[10px] text-ink-500">{color.rgb}</p>
                    </div>
                    <button type="button" onClick={() => copy(color.hex)} className="text-ink-600 hover:text-white">
                      {copied === color.hex ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
