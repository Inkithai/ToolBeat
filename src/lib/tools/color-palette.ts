/**
 * Harmonious palette generation from a base color, using the HSL helpers in
 * ./color. Schemes rotate hue (and vary lightness for monochrome).
 */

import { hslToHex, parseHex, rgbToHex, rgbToHsl } from "./color";

export type PaletteScheme =
  | "analogous"
  | "complementary"
  | "split-complementary"
  | "triadic"
  | "tetradic"
  | "monochrome";

export const PALETTE_SCHEMES: { value: PaletteScheme; label: string }[] = [
  { value: "analogous", label: "Analogous" },
  { value: "complementary", label: "Complementary" },
  { value: "split-complementary", label: "Split-complementary" },
  { value: "triadic", label: "Triadic" },
  { value: "tetradic", label: "Tetradic" },
  { value: "monochrome", label: "Monochrome" },
];

type Slot = { hue: number; lightness: number };

const SCHEME_SLOTS: Record<PaletteScheme, Slot[]> = {
  analogous: [
    { hue: -30, lightness: 0 },
    { hue: -15, lightness: 0 },
    { hue: 0, lightness: 0 },
    { hue: 15, lightness: 0 },
    { hue: 30, lightness: 0 },
  ],
  complementary: [
    { hue: 0, lightness: 0 },
    { hue: 180, lightness: 0 },
    { hue: 0, lightness: 18 },
    { hue: 180, lightness: 18 },
    { hue: 0, lightness: -18 },
  ],
  "split-complementary": [
    { hue: 0, lightness: 0 },
    { hue: 150, lightness: 0 },
    { hue: 210, lightness: 0 },
    { hue: 150, lightness: 18 },
    { hue: 210, lightness: 18 },
  ],
  triadic: [
    { hue: 0, lightness: 0 },
    { hue: 120, lightness: 0 },
    { hue: 240, lightness: 0 },
    { hue: 0, lightness: 20 },
    { hue: 120, lightness: 20 },
  ],
  tetradic: [
    { hue: 0, lightness: 0 },
    { hue: 90, lightness: 0 },
    { hue: 180, lightness: 0 },
    { hue: 270, lightness: 0 },
    { hue: 45, lightness: 0 },
  ],
  monochrome: [
    { hue: 0, lightness: -25 },
    { hue: 0, lightness: -12 },
    { hue: 0, lightness: 0 },
    { hue: 0, lightness: 12 },
    { hue: 0, lightness: 25 },
  ],
};

/** Generate five hex colors from a base hex color and a harmony scheme. */
export function generatePalette(baseHex: string, scheme: PaletteScheme): string[] {
  const rgb = parseHex(baseHex); // throws on invalid hex
  const base = rgbToHex(rgb);
  const { h, s, l } = rgbToHsl(rgb);
  return SCHEME_SLOTS[scheme].map((slot) => {
    // The (0, 0) slot is the base color itself, kept verbatim — round-tripping
    // through rounded HSL values can drift a few units off the original hex.
    if (slot.hue === 0 && slot.lightness === 0) return base;
    return hslToHex({
      h: ((h + slot.hue) % 360 + 360) % 360,
      s,
      l: Math.min(96, Math.max(4, l + slot.lightness)),
    });
  });
}
