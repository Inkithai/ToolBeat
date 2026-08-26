"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { usePersistentState } from "@/lib/storage/preferences";
import {
  buildGradient,
  type GradientKind,
  type GradientStop,
  type RadialShape,
} from "@/lib/tools/css-gradient";

type GradientPreferences = {
  kind: GradientKind;
  angle: number;
  shape: RadialShape;
  stops: GradientStop[];
};

const DEFAULTS: GradientPreferences = {
  kind: "linear",
  angle: 135,
  shape: "circle",
  stops: [
    { color: "#6366f1", position: 0 },
    { color: "#0ea5e9", position: 55 },
    { color: "#0f172a", position: 100 },
  ],
};

export default function CssGradientGeneratorClient() {
  const [prefs, setPrefs] = usePersistentState<GradientPreferences>("convertlab:css-gradient", DEFAULTS);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => {
    try {
      return { value: buildGradient(prefs.kind, { angle: prefs.angle, shape: prefs.shape, stops: prefs.stops }), error: "" };
    } catch (caught) {
      return { value: "", error: caught instanceof Error ? caught.message : "Invalid gradient." };
    }
  }, [prefs]);

  const updateStop = useCallback(
    (index: number, patch: Partial<GradientStop>) => {
      setPrefs({ stops: prefs.stops.map((stop, i) => (i === index ? { ...stop, ...patch } : stop)) });
    },
    [prefs.stops, setPrefs],
  );

  const copy = useCallback(async () => {
    if (!css.value) return;
    await navigator.clipboard.writeText(css.value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [css.value]);

  const field = "rounded-lg border border-white/10 bg-navy-900 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-400/50";

  return (
    <div className="space-y-4">
      <div
        className="h-44 rounded-xl border border-white/10"
        style={css.value ? { background: css.value } : undefined}
        aria-label="Gradient preview"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-ink-200">
          Type
          <select
            value={prefs.kind}
            onChange={(event) => setPrefs({ kind: event.target.value as GradientKind })}
            className={`${field} border px-2 py-1.5`}
          >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
            <option value="conic">Conic</option>
          </select>
        </label>
        {prefs.kind !== "radial" ? (
          <label className="flex items-center gap-2 text-xs text-ink-200">
            Angle
            <input
              type="range"
              min={0}
              max={360}
              value={prefs.angle}
              onChange={(event) => setPrefs({ angle: Number(event.target.value) })}
              className="w-32 accent-indigo-500"
            />
            <span className="w-9 font-mono">{prefs.angle}°</span>
          </label>
        ) : (
          <label className="flex items-center gap-2 text-xs text-ink-200">
            Shape
            <select
              value={prefs.shape}
              onChange={(event) => setPrefs({ shape: event.target.value as RadialShape })}
              className={`${field} border px-2 py-1.5`}
            >
              <option value="circle">Circle</option>
              <option value="ellipse">Ellipse</option>
              <option value="closest-side">Closest side</option>
              <option value="farthest-corner">Farthest corner</option>
            </select>
          </label>
        )}
      </div>

      <div className="space-y-2">
        {prefs.stops.map((stop, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="color"
              value={stop.color}
              onChange={(event) => updateStop(index, { color: event.target.value })}
              className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
            />
            <input
              type="text"
              value={stop.color}
              onChange={(event) => updateStop(index, { color: event.target.value })}
              className={`${field} w-24 font-mono`}
            />
            <input
              type="number"
              min={0}
              max={100}
              value={stop.position}
              onChange={(event) => updateStop(index, { position: Number(event.target.value) })}
              className={`${field} w-20`}
            />
            <span className="text-xs text-ink-600">%</span>
            {prefs.stops.length > 1 && (
              <button
                type="button"
                onClick={() => setPrefs({ stops: prefs.stops.filter((_, i) => i !== index) })}
                className="ml-auto rounded-lg border border-white/10 px-2 py-1 text-ink-500 transition-colors hover:border-rose-400/40 hover:text-rose-300"
                aria-label="Remove stop"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setPrefs({
              stops: [
                ...prefs.stops,
                { color: "#ffffff", position: Math.round(100 / (prefs.stops.length + 1)) },
              ].slice(0, 12),
            })
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Add stop
        </button>
      </div>

      <div>
        <p className="meta mb-1.5 text-ink-500">CSS</p>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded-lg border border-white/10 bg-navy-900 px-3 py-2 font-mono text-xs text-emerald-300">
            {css.value || <span className="text-ink-600">{css.error || "background: …"}</span>}
          </code>
          <button
            type="button"
            onClick={() => void copy()}
            disabled={!css.value}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white disabled:opacity-40"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        {css.error && <p className="mt-1.5 text-xs text-rose-300">{css.error}</p>}
      </div>
    </div>
  );
}
