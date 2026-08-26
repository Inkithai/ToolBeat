"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, ImageUp, Trash2 } from "lucide-react";
import { computeTargetDimensions, formatBytes } from "@/lib/tools/image-ops";
import { exportImage, loadImageFile, revokeLoadedImage, type LoadedImage } from "@/lib/tools/image-io";
import IoWorkspace from "@/components/tools/io-workspace";

type Resized = {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
};

const FORMATS = [
  { value: "image/png", label: "PNG" },
  { value: "image/jpeg", label: "JPG" },
  { value: "image/webp", label: "WebP" },
] as const;

export default function ImageResizerClient() {
  const [source, setSource] = useState<LoadedImage | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [targetWidth, setTargetWidth] = useState("");
  const [targetHeight, setTargetHeight] = useState("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [format, setFormat] = useState<(typeof FORMATS)[number]["value"]>("image/png");
  const [result, setResult] = useState<Resized | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const clear = useCallback(() => {
    revokeLoadedImage(source);
    setSource(null);
    setResult(null);
    setOriginalSize(0);
    setTargetWidth("");
    setTargetHeight("");
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
        setOriginalSize(file.size);
        setTargetWidth(String(loaded.width));
        setTargetHeight(String(loaded.height));
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
    setBusy(true);
    const run = async () => {
      try {
        const target = computeTargetDimensions(
          source.width,
          source.height,
          targetWidth ? Number(targetWidth) : undefined,
          targetHeight ? Number(targetHeight) : undefined,
          keepAspect,
        );
        const exported = await exportImage(source, target.width, target.height, format, 0.92);
        if (!cancelled) {
          setResult(exported);
          setError("");
        }
      } catch (caught) {
        if (!cancelled) {
          setResult(null);
          setError(caught instanceof Error ? caught.message : "The resize failed.");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [source, targetWidth, targetHeight, keepAspect, format]);

  const extension = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";

  return (
    <IoWorkspace
      inputLabel="Image"
      outputLabel="Resized"
      status={error ? "error" : busy ? "processing" : result ? "complete" : "idle"}
      outputAction={
        result ? (
          <a
            href={result.dataUrl}
            download={`resized-${result.width}x${result.height}.${extension}`}
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
        ) : result ? (
          <p className="mt-3 text-xs text-ink-500">
            {source ? `${source.width} × ${source.height} → ` : ""}
            {result.width} × {result.height} px · {formatBytes(result.blob.size)}. Processed locally in your browser.
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
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-ink-200">
                  Width (px)
                  <input
                    type="number"
                    min={1}
                    value={targetWidth}
                    onChange={(event) => setTargetWidth(event.target.value)}
                    className="field mt-1 w-full text-sm"
                  />
                </label>
                <label className="block text-xs text-ink-200">
                  Height (px)
                  <input
                    type="number"
                    min={1}
                    value={targetHeight}
                    onChange={(event) => setTargetHeight(event.target.value)}
                    className="field mt-1 w-full text-sm"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-ink-200">
                  <input
                    type="checkbox"
                    checked={keepAspect}
                    onChange={(event) => setKeepAspect(event.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
                  />
                  Keep aspect ratio
                </label>
                <label className="flex items-center gap-2 text-xs text-ink-200">
                  Format
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
                </label>
              </div>
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
              <img src={result.dataUrl} alt="Resized preview" className="max-h-52 rounded" />
            </div>
            <p className="text-xs text-ink-500">
              {result.width} × {result.height} px · {formatBytes(result.blob.size)}
              {originalSize ? (
                <span className="text-ink-600"> · original {formatBytes(originalSize)}</span>
              ) : null}
            </p>
          </div>
        ) : (
          <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            {busy ? "Processing…" : "Resized image appears here"}
          </div>
        )
      }
    />
  );
}
