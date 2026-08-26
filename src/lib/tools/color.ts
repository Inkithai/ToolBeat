/**
 * Color math: HEX ↔ RGB ↔ HSL and WCAG contrast.
 *
 * All functions are pure and total over valid inputs; invalid color strings
 * throw with a message the UI can show.
 */

export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function parseHex(input: string): Rgb {
  const match = HEX_RE.exec(input.trim());
  if (!match) throw new Error("Enter a hex color like #6366f1 or #66f.");
  let hex = match[1];
  if (hex.length === 3) hex = hex.split("").map((char) => char + char).join("");
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: Math.round(lightness * 100) };

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue: number;
  if (max === rn) hue = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) hue = ((bn - rn) / delta + 2) / 6;
  else hue = ((rn - gn) / delta + 4) / 6;

  return {
    h: Math.round(hue * 360) % 360,
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const sn = s / 100;
  const ln = l / 100;
  const hue = ((h % 360) + 360) % 360 / 360;

  if (sn === 0) {
    const gray = Math.round(ln * 255);
    return rgbToHex({ r: gray, g: gray, b: gray });
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) value = p + (q - p) * 6 * value;
    else if (value < 1 / 2) value = q;
    else if (value < 2 / 3) value = p + (q - p) * (2 / 3 - value) * 6;
    else value = p;
    return Math.round(value * 255);
  };

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return rgbToHex({
    r: hue2rgb(p, q, hue + 1 / 3),
    g: hue2rgb(p, q, hue),
    b: hue2rgb(p, q, hue - 1 / 3),
  });
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG contrast ratio between two hex colors, 1–21. */
export function contrastRatio(hexA: string, hexB: string): number {
  const la = relativeLuminance(parseHex(hexA));
  const lb = relativeLuminance(parseHex(hexB));
  const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}
