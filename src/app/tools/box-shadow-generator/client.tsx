"use client";

import { useState, useMemo } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(4);
  const [blur, setBlur] = useState(12);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(25);
  const [inset, setInset] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [copied, setCopied] = useState(false);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "0, 0, 0";
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  };

  const css = useMemo(() => {
    const rgba = `rgba(${hexToRgb(color)}, ${opacity / 100})`;
    return `box-shadow: ${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgba}${inset ? " inset" : ""};`;
  }, [offsetX, offsetY, blur, spread, color, opacity, inset]);

  const boxShadowStyle = useMemo(() => {
    const rgba = `rgba(${hexToRgb(color)}, ${opacity / 100})`;
    return `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgba}${inset ? " inset" : ""}`;
  }, [offsetX, offsetY, blur, spread, color, opacity, inset]);

  const copy = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const randomize = () => {
    setOffsetX(Math.floor(Math.random() * 40) - 20);
    setOffsetY(Math.floor(Math.random() * 40) - 20);
    setBlur(Math.floor(Math.random() * 50));
    setSpread(Math.floor(Math.random() * 20) - 10);
    setOpacity(Math.floor(Math.random() * 60) + 10);
    setInset(Math.random() > 0.7);
  };

  return (
    <IoWorkspace
      inputLabel="Shadow controls"
      outputLabel="CSS output"
      status="complete"
      outputAction={
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy CSS"}
        </button>
      }
      input={
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">Offset X: {offsetX}px</span>
              <input type="range" min={-50} max={50} value={offsetX} onChange={e => setOffsetX(+e.target.value)} className="w-full accent-indigo-500" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">Offset Y: {offsetY}px</span>
              <input type="range" min={-50} max={50} value={offsetY} onChange={e => setOffsetY(+e.target.value)} className="w-full accent-indigo-500" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">Blur: {blur}px</span>
              <input type="range" min={0} max={100} value={blur} onChange={e => setBlur(+e.target.value)} className="w-full accent-indigo-500" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">Spread: {spread}px</span>
              <input type="range" min={-30} max={50} value={spread} onChange={e => setSpread(+e.target.value)} className="w-full accent-indigo-500" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">Color</span>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent" />
                <input type="text" value={color} onChange={e => setColor(e.target.value)} className="field w-full font-mono text-xs" />
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">Opacity: {opacity}%</span>
              <input type="range" min={0} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)} className="w-full accent-indigo-500" />
            </label>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-ink-300">
              <input type="checkbox" checked={inset} onChange={e => setInset(e.target.checked)} className="rounded accent-indigo-500" />
              Inset shadow
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-300">
              Background
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-7 w-9 cursor-pointer rounded border border-white/10 bg-transparent" />
            </label>
            <button type="button" onClick={randomize} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-ink-300 transition-colors hover:text-white">
              <RefreshCw className="h-3 w-3" /> Randomize
            </button>
          </div>
        </div>
      }
      output={
        <div className="flex min-h-[16rem] flex-col items-center justify-center rounded-xl" style={{ backgroundColor: bgColor }}>
          <div
            className="h-32 w-48 rounded-xl border border-white/20"
            style={{ boxShadow: boxShadowStyle, backgroundColor: bgColor === "#ffffff" ? "#e2e8f0" : "#ffffff" }}
          />
          <pre className="mt-6 w-full overflow-auto rounded-lg border border-white/[0.06] bg-navy-900/80 p-3 font-mono text-xs leading-relaxed text-cyan-300">
            {css}
          </pre>
        </div>
      }
    />
  );
}
