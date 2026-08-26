"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

const SIZES = [128, 256, 384, 512];
const ERROR_CORRECTION = [
  { value: "L", label: "Low (7%)" },
  { value: "M", label: "Medium (15%)" },
  { value: "Q", label: "Quartile (25%)" },
  { value: "H", label: "High (30%)" },
] as const;

export default function QrCodeGeneratorClient() {
  const [text, setText] = useState("https://convertlab.vercel.app");
  const [size, setSize] = useState(384);
  const [errorLevel, setErrorLevel] = useState<(typeof ERROR_CORRECTION)[number]["value"]>("M");
  const [dark, setDark] = useState("#0f172a");
  const [light, setLight] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!text.trim()) {
      setDataUrl("");
      setError("");
      return;
    }
    QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: errorLevel,
      color: { dark, light },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError("");
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setDataUrl("");
          setError(
            caught instanceof Error
              ? caught.message
              : "This content is too long for a QR code. Shorten the text or lower the error correction.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [text, size, errorLevel, dark, light]);

  const baseName = useCallback(() => {
    const clean = text.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 40);
    return `qr-${clean || "code"}`;
  }, [text]);

  return (
    <IoWorkspace
      inputLabel="Content"
      outputLabel="QR code"
      status={error ? "error" : dataUrl ? "complete" : "idle"}
      outputAction={
        dataUrl ? (
          <a
            href={dataUrl}
            download={`${baseName()}.png`}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
          >
            <Download className="h-3 w-3" /> PNG
          </a>
        ) : undefined
      }
      footer={
        error ? (
          <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
            {error}
          </p>
        ) : (
          <p className="mt-3 text-xs text-ink-600">Rendered locally in your browser. The download is a plain PNG file.</p>
        )
      }
      input={
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="URL, Wi-Fi config, vCard — any text…"
            rows={5}
            className="field w-full resize-y text-sm"
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-ink-200">
              Size
              <select
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
                className="field py-1.5 text-xs"
              >
                {SIZES.map((value) => (
                  <option key={value} value={value}>
                    {value} px
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-200">
              Error correction
              <select
                value={errorLevel}
                onChange={(event) => setErrorLevel(event.target.value as typeof errorLevel)}
                className="field py-1.5 text-xs"
              >
                {ERROR_CORRECTION.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-200">
              Foreground
              <input
                type="color"
                value={dark}
                onChange={(event) => setDark(event.target.value)}
                className="h-7 w-9 cursor-pointer rounded border border-white/10 bg-transparent"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-200">
              Background
              <input
                type="color"
                value={light}
                onChange={(event) => setLight(event.target.value)}
                className="h-7 w-9 cursor-pointer rounded border border-white/10 bg-transparent"
              />
            </label>
          </div>
        </div>
      }
      output={
        dataUrl ? (
          <div className="flex min-h-[16rem] items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <img src={dataUrl} alt={`QR code for: ${text.slice(0, 80)}`} className="max-h-72 rounded-md" width={size} height={size} />
          </div>
        ) : (
          <div className="flex min-h-[16rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            {error ? "" : "The QR code appears here"}
          </div>
        )
      }
    />
  );
}
