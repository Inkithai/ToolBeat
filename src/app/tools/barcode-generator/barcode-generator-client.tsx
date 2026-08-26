"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { BARCODE_FORMATS, renderBarcode, type BarcodeFormat } from "@/lib/tools/barcode";

export default function BarcodeGeneratorClient() {
  const [value, setValue] = useState("CONVERTLAB-100");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [moduleWidth, setModuleWidth] = useState(1.6);
  const [height, setHeight] = useState(64);
  const [showText, setShowText] = useState(true);

  const [svg, setSvg] = useState("");
  const [width, setWidth] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!value.trim()) {
      setSvg("");
      setError("");
      return;
    }
    setBusy(true);
    const timer = window.setTimeout(() => {
      renderBarcode(value, format, { moduleWidth, height, displayValue: showText })
        .then((result) => {
          if (cancelled) return;
          setSvg(result.svg);
          setWidth(result.width);
          setError("");
        })
        .catch((caught: unknown) => {
          if (cancelled) return;
          setSvg("");
          setError(caught instanceof Error ? caught.message : "Could not render that barcode.");
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value, format, moduleWidth, height, showText]);

  const pngUrl = useMemo(() => {
    if (!svg) return "";
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, [svg]);

  const downloadSvg = useCallback(() => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `barcode-${value.slice(0, 24).replace(/[^a-z0-9]+/gi, "-") || "code"}.svg`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [svg, value]);

  const downloadPng = useCallback(() => {
    if (!pngUrl) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * 2));
      canvas.height = Math.max(1, Math.round(Number.parseFloat(String(svg.match(/height="([\d.]+)px"?/)?.[1] ?? height)) * 2));
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const anchor = document.createElement("a");
      anchor.href = canvas.toDataURL("image/png");
      anchor.download = `barcode-${value.slice(0, 24).replace(/[^a-z0-9]+/gi, "-") || "code"}.png`;
      anchor.click();
    };
    image.src = pngUrl;
  }, [pngUrl, svg, height, width, value]);

  const activeFormat = BARCODE_FORMATS.find((item) => item.value === format);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Value</span>
          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="field w-full font-mono text-sm"
            placeholder="1234567890"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Format</span>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as BarcodeFormat)}
            className="field w-full text-sm"
          >
            {BARCODE_FORMATS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {activeFormat && <p className="text-xs text-ink-600">{activeFormat.hint}.</p>}

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-ink-200">
          Module width
          <input
            type="range"
            min={1}
            max={4}
            step={0.2}
            value={moduleWidth}
            onChange={(event) => setModuleWidth(Number(event.target.value))}
            className="w-28 accent-indigo-500"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-200">
          Height
          <input
            type="range"
            min={32}
            max={160}
            step={8}
            value={height}
            onChange={(event) => setHeight(Number(event.target.value))}
            className="w-28 accent-indigo-500"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-200">
          <input
            type="checkbox"
            checked={showText}
            onChange={(event) => setShowText(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
          />
          Show value under bars
        </label>
      </div>

      <div className="flex min-h-40 items-center justify-center overflow-x-auto rounded-xl border border-white/10 bg-white p-4">
        {error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : svg ? (
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <p className="text-sm text-ink-400">{busy ? "Rendering…" : "The barcode appears here"}</p>
        )}
      </div>

      {svg && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={downloadSvg}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/30 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition-colors hover:text-white"
          >
            <Download className="h-3.5 w-3.5" /> SVG
          </button>
          <button
            type="button"
            onClick={downloadPng}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" /> PNG
          </button>
        </div>
      )}
    </div>
  );
}
