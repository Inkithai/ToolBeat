import { describe, expect, it } from "vitest";
import { MAX_MEGAPIXELS, computeTargetDimensions, formatBytes, maxScaleForPixelLimit } from "./image-ops";

describe("computeTargetDimensions", () => {
  it("keeps aspect when both targets are given (smallest scale wins)", () => {
    // 1000×500 into a 600×600 box → width is the binding constraint (0.6)
    expect(computeTargetDimensions(1000, 500, 600, 600, true)).toEqual({ width: 600, height: 300 });
    // 1000×500 into a 2000×600 box → height is the binding constraint (1.2)
    expect(computeTargetDimensions(1000, 500, 2000, 600, true)).toEqual({ width: 1200, height: 600 });
  });

  it("derives the missing dimension from one target", () => {
    expect(computeTargetDimensions(1000, 500, 300, undefined, true)).toEqual({ width: 300, height: 150 });
    expect(computeTargetDimensions(1000, 500, undefined, 250, true)).toEqual({ width: 500, height: 250 });
  });

  it("returns the source when no targets are given", () => {
    expect(computeTargetDimensions(123, 456)).toEqual({ width: 123, height: 456 });
  });

  it("stretches literally when keep-aspect is off", () => {
    expect(computeTargetDimensions(1000, 500, 300, 300, false)).toEqual({ width: 300, height: 300 });
  });

  it("rounds to whole pixels with a 1px floor", () => {
    expect(computeTargetDimensions(10, 10, 1, 1, true)).toEqual({ width: 1, height: 1 });
  });

  it("rejects unreadable sources", () => {
    expect(() => computeTargetDimensions(0, 500)).toThrow(/readable dimensions/);
  });

  it("rejects results past the canvas limit", () => {
    expect(() => computeTargetDimensions(10, 10, 40000, 10, false)).toThrow(/32,768/);
  });
});

describe("maxScaleForPixelLimit", () => {
  it("returns 1 under the budget", () => {
    expect(maxScaleForPixelLimit(1000, 1000)).toBe(1);
  });

  it("scales down to stay under the budget", () => {
    // 8000×8000 = 64MP vs 40MP budget → scale √(40/64) ≈ 0.79
    const scale = maxScaleForPixelLimit(8000, 8000);
    expect(scale).toBeCloseTo(Math.sqrt(MAX_MEGAPIXELS / 64), 5);
    expect(8000 * scale * (8000 * scale)).toBeLessThanOrEqual(MAX_MEGAPIXELS * 1_000_000 + 1);
  });
});

describe("formatBytes", () => {
  it("formats bytes, KB and MB", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(842 * 1024)).toBe("842 KB");
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1.5 MB");
    expect(formatBytes(-5)).toBe("0 B");
    expect(formatBytes(Number.NaN)).toBe("0 B");
  });
});
