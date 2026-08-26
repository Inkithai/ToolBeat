/**
 * Pure geometry for the image tools. The canvas work itself lives in the
 * browser client components; the math here (scaling, limits, sizes) is what
 * gets unit-tested.
 */

/** Maximum canvas area the image tools accept, mirroring the converters. */
export const MAX_MEGAPIXELS = 40;

export type TargetDimensions = {
  width: number;
  height: number;
};

/**
 * Compute the output dimensions for a resize.
 *
 * - Both targets given with "keep aspect": the smaller scale wins, so the
 *   image always fits inside the target box.
 * - One target given (or keep aspect off): the other dimension follows the
 *   same scale, preserving proportions.
 * - Keep aspect off with both targets: literal stretch.
 */
export function computeTargetDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth?: number,
  targetHeight?: number,
  keepAspect = true,
): TargetDimensions {
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error("The image has no readable dimensions.");
  }

  let scale = 1;
  if (keepAspect) {
    const candidateScales: number[] = [];
    if (targetWidth && targetWidth > 0) candidateScales.push(targetWidth / sourceWidth);
    if (targetHeight && targetHeight > 0) candidateScales.push(targetHeight / sourceHeight);
    if (candidateScales.length) scale = Math.min(...candidateScales);
  } else {
    // Non-aspect stretch: apply each axis independently.
    return {
      width: clampDimension(targetWidth && targetWidth > 0 ? targetWidth : sourceWidth),
      height: clampDimension(targetHeight && targetHeight > 0 ? targetHeight : sourceHeight),
    };
  }

  return {
    width: clampDimension(sourceWidth * scale),
    height: clampDimension(sourceHeight * scale),
  };
}

function clampDimension(value: number): number {
  const pixels = Math.max(1, Math.round(value));
  if (pixels > 32768) throw new Error("The resized image would exceed the 32,768 pixel canvas limit.");
  return pixels;
}

/** Largest uniform scale that keeps the result under the megapixel budget. */
export function maxScaleForPixelLimit(sourceWidth: number, sourceHeight: number, maxMegapixels = MAX_MEGAPIXELS): number {
  const pixels = sourceWidth * sourceHeight;
  if (pixels <= 0) return 1;
  const budget = maxMegapixels * 1_000_000;
  if (pixels <= budget) return 1;
  return Math.sqrt(budget / pixels);
}

/** "1.4 MB" / "842 KB" style sizes for before/after comparisons. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round((bytes / 1024) * 10) / 10} KB`;
  return `${Math.round((bytes / (1024 * 1024)) * 100) / 100} MB`;
}
