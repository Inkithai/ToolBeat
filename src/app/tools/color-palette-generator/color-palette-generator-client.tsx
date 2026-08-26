"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { usePersistentState } from "@/lib/storage/preferences";
import { generatePalette, PALETTE_SCHEMES, type PaletteScheme } from "@/lib/tools/color-palette";
import { contrastRatio } from "@/lib/tools/color";

type PalettePreferences = { base: string; scheme: PaletteScheme };

const DEFAULTS: PalettePreferences = { base: "#6366f1", scheme: "analogous" };

export default function ColorPaletteGeneratorClient() {
  const [prefs, setPrefs] = usePersistentState<PalettePreferences>("convertlab:color-palette", DEFAULTS);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const palette = useMemo(() => {
    try {
      return generatePalette(prefs.base, prefs.scheme);
    } catch {
      return null;
    }
  }, [prefs]);

  const copy = async (hex: string, index: number) => {
    await navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    window.setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Base color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={prefs.base}
              onChange={(event) => setPrefs({ base: event.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
            />
            <input
              type="text"
              value={prefs.base}
              onChange={(event) => setPrefs({ base: event.target.value })}
              className="field w-28 font-mono text-sm"
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Scheme</span>
          <select
            value={prefs.scheme}
            onChange={(event) => setPrefs({ scheme: event.target.value as PaletteScheme })}
            className="field py-2 text-sm"
          >
            {PALETTE_SCHEMES.map((scheme) => (
              <option key={scheme.value} value={scheme.value}>
                {scheme.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {palette ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {palette.map((hex, index) => {
            const contrastOnDark = contrastRatio(hex, "#0b1220");
            const textClass = contrastOnDark >= 4 ? "text-white" : "text-slate-900";
            return (
              <div
                key={`${hex}-${index}`}
                className="group relative h-32 overflow-hidden rounded-xl border border-white/10"
                style={{ backgroundColor: hex }}
              >
                <div className={`flex h-full flex-col justify-end p-3 ${textClass}`}>
                  <span className="font-mono text-xs font-semibold opacity-80">{hex}</span>
                  <button
                    type="button"
                    onClick={() => void copy(hex, index)}
                    className="mt-1.5 inline-flex items-center gap-1 self-start rounded-md border border-current/20 px-2 py-0.5 text-[10px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    {copiedIndex === index ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedIndex === index ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          That base color is not a valid hex value — try something like #6366f1.
        </p>
      )}
    </div>
  );
}
