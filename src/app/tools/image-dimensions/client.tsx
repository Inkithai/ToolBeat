"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

type ImageInfo = {
  width: number;
  height: number;
  fileSize: number;
  type: string;
  name: string;
  aspectRatio: string;
  megapixels: string;
  orientation: string;
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export default function Client() {
  const [info, setInfo] = useState<ImageInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("Please select an image file."); return; }
    setError("");

    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      const g = gcd(img.naturalWidth, img.naturalHeight);
      const ratioW = img.naturalWidth / g;
      const ratioH = img.naturalHeight / g;

      setInfo({
        width: img.naturalWidth,
        height: img.naturalHeight,
        fileSize: f.size,
        type: f.type,
        name: f.name,
        aspectRatio: `${ratioW}:${ratioH}`,
        megapixels: ((img.naturalWidth * img.naturalHeight) / 1_000_000).toFixed(2),
        orientation: img.naturalWidth > img.naturalHeight ? "Landscape" : img.naturalWidth < img.naturalHeight ? "Portrait" : "Square",
      });
    };
    img.onerror = () => setError("Could not read this image.");
    img.src = url;
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const rows = info ? [
    { label: "Dimensions", value: `${info.width} × ${info.height} px` },
    { label: "Aspect Ratio", value: info.aspectRatio },
    { label: "Orientation", value: info.orientation },
    { label: "Megapixels", value: `${info.megapixels} MP` },
    { label: "File Size", value: formatBytes(info.fileSize) },
    { label: "Format", value: info.type },
    { label: "File Name", value: info.name },
  ] : [];

  return (
    <IoWorkspace
      inputLabel="Image"
      outputLabel="Dimensions & info"
      status={info ? "complete" : error ? "error" : "idle"}
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
          {previewUrl && (
            <div className="overflow-hidden rounded-lg border border-white/10">
              <img src={previewUrl} alt="Preview" className="max-h-32 w-full object-contain" />
            </div>
          )}
        </div>
      }
      output={
        info ? (
          <div className="space-y-2">
            <p className="font-mono text-3xl font-bold text-white">{info.width} × {info.height}</p>
            <p className="text-xs text-ink-500">pixels</p>
            <div className="mt-4 space-y-1.5">
              {rows.map(row => (
                <div key={row.label} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-ink-500">{row.label}</span>
                  <span className="text-xs font-semibold text-ink-200">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            Upload an image to see its details
          </div>
        )
      }
    />
  );
}
