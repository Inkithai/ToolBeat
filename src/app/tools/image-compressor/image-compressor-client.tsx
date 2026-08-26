"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, ImageUp, Trash2 } from "lucide-react";
import { formatBytes } from "@/lib/tools/image-ops";
import { exportImage, loadImageFile, revokeLoadedImage, type LoadedImage } from "@/lib/tools/image-io";
import IoWorkspace from "@/components/tools/io-workspace";

type Compressed = {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
};

const FORMATS = [
  { value: "image/jpeg", label: "JPG" },
  { value: "image/webp", label: "WebP" },
  { value: "image/png", label: "PNG (lossless)" },
] as const;

export default function ImageCompressorClient() {
  const [source, setSource] = useState<LoadedImage | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<(typeof FORMATS)[number]["value"]>("image/webp");
  const [result, setResult] = useState<Compressed | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const clear = useCallback(() => {
    revokeLoadedImage(source);
    setSource(null);
    setOriginalFile(null);
    setResult(null);
    setOriginalSize(0);
    setError("");
  }, [source]);

  const handleFile = useCallback(
    async (file: File) => {
      setError("");
      setBusy(true);
      try {
        const loaded = await loadImageFile(file);
        revokeLoadedImage(source);
        setSource(loaded);
        setOriginalFile(file);
        setOriginalSize(file.size);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "The image could not be loaded.");
      } finally {
        setBusy(false);
      }
    },
    [source],
  );

  useEffect(() => {
    let cancelled = false;
    if (!source) {
      setResult(null);
      return;
    }
    if (format === "image/png" || !originalFile) {
      // PNG is lossless and the original bytes are already the best PNG we
      // can produce, so for PNG output we simply pass the original through.
      if (originalFile) {
        setResult({ blob: originalFile, dataUrl: source.url, width: source.width, height: source.height });
      }
      return;
    }
    setBusy(true);
    exportImage(source, source.width, source.height, format, quality / 100)
      .then((exported) => {
        if (!cancelled) setResult(exported);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Compression failed.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [source, format, quality, originalSize, originalFile]);

  const savings = result && originalSize ? Math.round((1 - result.blob.size / originalSize) * 100) : 0;

  return (
    <IoWorkspace
      inputLabel="Image"
      outputLabel="Compressed"
      status={error ? "error" : busy ? "processing" : result ? "complete" : "idle"}
      outputAction={
        result ? (
          <a
            href={result.dataUrl}
            download={`compressed-${result.width}x${result.height}${format === "image/jpeg" ? ".jpg" : format === "image/webp" ? ".webp" : ".png"}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
          >
            <Download className="h-3 w-3" /> Download
          </a>
        ) : undefined
      }
      footer={
        error ? (
          <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
            {error}
          </p>
        ) : result && originalSize > 0 ? (
          <p className="mt-3 text-xs text-ink-500">
            {formatBytes(originalSize)} → {formatBytes(result.blob.size)}{" "}
            <span className={savings > 0 ? "text-emerald-300" : "text-ink-400"}>
              ({savings > 0 ? `saved ${savings}%` : "no savings"})
            </span>
            . Done entirely in your browser — the image never leaves this page.
          </p>
        ) : undefined
      }
      input={
        <div className="space-y-3">
          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center transition-colors hover:border-indigo-400/40"
          >
            <ImageUp className="h-6 w-6 text-ink-500" />
            <span className="text-sm font-semibold text-ink-200">
              {source ? `${source.width} × ${source.height} px loaded` : "Drop an image or click to choose"}
            </span>
            <span className="text-xs text-ink-500">PNG, JPG, WebP, SVG, GIF (first frame)</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.target.value = "";
              }}
            />
          </label>
          {source && (
            <>
              <label className="block text-xs text-ink-200">
                Quality <span className="font-bold text-white">{quality}</span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={quality}
                  disabled={format === "image/png"}
                  onChange={(event) => setQuality(Number(event.target.value))}
                  className="mt-2 w-full accent-indigo-500 disabled:opacity-40"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-ink-200">
                Output format
                <select
                  value={format}
                  onChange={(event) => setFormat(event.target.value as typeof format)}
                  className="field py-1.5 text-xs"
                >
                  {FORMATS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {format === "image/png" && <span className="text-ink-600">(quality ignored)</span>}
              </label>
              <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition-colors hover:text-rose-300">
                <Trash2 className="h-3 w-3" /> Remove image
              </button>
            </>
          )}
        </div>
      }
      output={
        result ? (
          <div className="space-y-2">
            <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-white/[0.06] bg-[repeating-conic-gradient(rgba(255,255,255,0.04)_0_25%,transparent_0_50%)] bg-[length:16px_16px] p-3">
              <img src={result.dataUrl} alt="Compressed preview" className="max-h-52 rounded" />
            </div>
            <p className="text-xs text-ink-500">
              {result.width} × {result.height} px · {formatBytes(result.blob.size)}
            </p>
          </div>
        ) : (
          <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            {busy ? "Processing…" : "Compressed image appears here"}
          </div>
        )
      }
    />
  );
}
