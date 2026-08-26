"use client";

import { useState, useRef, useCallback } from "react";
import NextImage from "next/image";
import { UploadCloud, Download } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 }); // percentages
  // Natural size of the loaded image; only used to satisfy next/image's
  // width/height contract — the classes below still control the actual box.
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setError("");
    const url = URL.createObjectURL(f);
    setImageUrl(url);
    setCrop({ x: 10, y: 10, w: 80, h: 80 });
  }, []);

  const downloadCrop = useCallback(() => {
    if (!imageUrl || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const sx = (crop.x / 100) * img.width;
      const sy = (crop.y / 100) * img.height;
      const sw = (crop.w / 100) * img.width;
      const sh = (crop.h / 100) * img.height;
      canvas.width = sw;
      canvas.height = sh;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cropped.png";
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.src = imageUrl;
  }, [imageUrl, crop]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    const relY = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicking on the crop rectangle edges
    const edge = 2;
    if (Math.abs(relX - crop.x) < edge) { setDragType("left"); setIsDragging(true); setDragStart({ x: relX, y: relY }); return; }
    if (Math.abs(relX - (crop.x + crop.w)) < edge) { setDragType("right"); setIsDragging(true); setDragStart({ x: relX, y: relY }); return; }
    if (Math.abs(relY - crop.y) < edge) { setDragType("top"); setIsDragging(true); setDragStart({ x: relX, y: relY }); return; }
    if (Math.abs(relY - (crop.y + crop.h)) < edge) { setDragType("bottom"); setIsDragging(true); setDragStart({ x: relX, y: relY }); return; }

    // Otherwise move the crop area
    setDragType("move");
    setIsDragging(true);
    setDragStart({ x: relX - crop.x, y: relY - crop.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    const relY = ((e.clientY - rect.top) / rect.height) * 100;

    setCrop(prev => {
      const next = { ...prev };
      switch (dragType) {
        case "move":
          next.x = Math.max(0, Math.min(100 - prev.w, relX - dragStart.x));
          next.y = Math.max(0, Math.min(100 - prev.h, relY - dragStart.y));
          break;
        case "left":
          const newX = Math.max(0, Math.min(prev.x + prev.w - 5, relX));
          next.w = prev.w + (prev.x - newX);
          next.x = newX;
          break;
        case "right":
          next.w = Math.max(5, Math.min(100 - prev.x, relX - prev.x));
          break;
        case "top":
          const newY = Math.max(0, Math.min(prev.y + prev.h - 5, relY));
          next.h = prev.h + (prev.y - newY);
          next.y = newY;
          break;
        case "bottom":
          next.h = Math.max(5, Math.min(100 - prev.y, relY - prev.y));
          break;
      }
      return next;
    });
  };

  const handleMouseUp = () => { setIsDragging(false); setDragType(""); };

  return (
    <IoWorkspace
      inputLabel="Image"
      outputLabel="Cropped result"
      status={imageUrl ? "complete" : error ? "error" : "idle"}
      footer={error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">{error}</p> : undefined}
      input={
        <div className="space-y-3">
          <div
            className="rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          >
            <UploadCloud className="mx-auto mb-2 h-8 w-8 text-ink-500" />
            <p className="text-sm text-ink-400">Drop an image here or</p>
            <label className="mt-2 inline-block cursor-pointer rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-200 hover:text-white">
              Browse
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="text-ink-400">
              X: <input type="number" min={0} max={100} value={Math.round(crop.x)} onChange={e => setCrop(p => ({ ...p, x: +e.target.value }))} className="field ml-1 w-16" />%
            </label>
            <label className="text-ink-400">
              Y: <input type="number" min={0} max={100} value={Math.round(crop.y)} onChange={e => setCrop(p => ({ ...p, y: +e.target.value }))} className="field ml-1 w-16" />%
            </label>
            <label className="text-ink-400">
              Width: <input type="number" min={1} max={100} value={Math.round(crop.w)} onChange={e => setCrop(p => ({ ...p, w: +e.target.value }))} className="field ml-1 w-16" />%
            </label>
            <label className="text-ink-400">
              Height: <input type="number" min={1} max={100} value={Math.round(crop.h)} onChange={e => setCrop(p => ({ ...p, h: +e.target.value }))} className="field ml-1 w-16" />%
            </label>
          </div>
          <button type="button" onClick={downloadCrop} disabled={!imageUrl} className="btn-primary w-full">
            <Download className="mr-2 inline h-4 w-4" /> Download Cropped Image
          </button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      }
      output={
        <div
          ref={containerRef}
          className="relative min-h-[16rem] overflow-hidden rounded-xl border border-white/10"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imageUrl ? (
            <>
              {/* Kept in normal flow (not `fill`) on purpose: the percentage
                  crop overlay below is positioned against this container, whose
                  box aspect must stay identical to the image's. Blob URLs
                  cannot use the optimizer, so this renders as a plain <img>. */}
              <NextImage
                src={imageUrl}
                alt="Source"
                width={naturalSize.width}
                height={naturalSize.height}
                unoptimized
                draggable={false}
                onLoad={(e) => setNaturalSize({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })}
                className="h-full w-full object-contain"
              />
              {/* Dark overlay outside crop */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bg-black/50" style={{ top: 0, left: 0, right: 0, height: `${crop.y}%` }} />
                <div className="absolute bg-black/50" style={{ top: `${crop.y}%`, left: 0, width: `${crop.x}%`, height: `${crop.h}%` }} />
                <div className="absolute bg-black/50" style={{ top: `${crop.y}%`, left: `${crop.x + crop.w}%`, right: 0, height: `${crop.h}%` }} />
                <div className="absolute bg-black/50" style={{ top: `${crop.y + crop.h}%`, left: 0, right: 0, bottom: 0 }} />
                {/* Crop border */}
                <div className="absolute border-2 border-dashed border-white/80" style={{ top: `${crop.y}%`, left: `${crop.x}%`, width: `${crop.w}%`, height: `${crop.h}%`, cursor: isDragging ? "grabbing" : "grab" }} />
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[16rem] items-center justify-center text-sm text-ink-600">
              Upload an image to crop
            </div>
          )}
        </div>
      }
    />
  );
}
