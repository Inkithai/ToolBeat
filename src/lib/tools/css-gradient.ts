/**
 * CSS gradient builder: linear, radial and conic, with editable stops.
 * Pure string construction — the preview is rendered from the same output.
 */

import { parseHex } from "./color";

export type GradientStop = {
  color: string;
  /** Position in percent, 0–100. */
  position: number;
};

export type GradientKind = "linear" | "radial" | "conic";

export function sortStops(stops: GradientStop[]): GradientStop[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

function renderStops(stops: GradientStop[]): string {
  if (stops.length === 0) throw new Error("Add at least one color stop.");
  for (const stop of stops) {
    parseHex(stop.color); // validates the color, throws a clear error otherwise
    if (!Number.isFinite(stop.position) || stop.position < 0 || stop.position > 100) {
      throw new Error(`Stop position ${stop.position} is out of range (0–100%).`);
    }
  }
  return sortStops(stops)
    .map((stop) => `${stop.color} ${Math.round(stop.position)}%`)
    .join(", ");
}

export function buildLinearGradient(angle: number, stops: GradientStop[]): string {
  if (!Number.isFinite(angle)) throw new Error("The angle must be a number.");
  const normalized = ((Math.round(angle) % 360) + 360) % 360;
  return `linear-gradient(${normalized}deg, ${renderStops(stops)})`;
}

export type RadialShape = "circle" | "ellipse" | "closest-side" | "closest-corner" | "farthest-corner";

export function buildRadialGradient(shape: RadialShape, stops: GradientStop[]): string {
  return `radial-gradient(${shape}, ${renderStops(stops)})`;
}

export function buildConicGradient(angle: number, stops: GradientStop[]): string {
  if (!Number.isFinite(angle)) throw new Error("The angle must be a number.");
  const normalized = ((Math.round(angle) % 360) + 360) % 360;
  return `conic-gradient(from ${normalized}deg, ${renderStops(stops)})`;
}

export function buildGradient(
  kind: GradientKind,
  options: {
    angle?: number;
    shape?: RadialShape;
    stops: GradientStop[];
  },
): string {
  if (kind === "linear") return buildLinearGradient(options.angle ?? 135, options.stops);
  if (kind === "radial") return buildRadialGradient(options.shape ?? "circle", options.stops);
  return buildConicGradient(options.angle ?? 0, options.stops);
}
