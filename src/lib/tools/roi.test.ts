import { describe, expect, it } from "vitest";
import { computeRoi } from "./roi";

describe("computeRoi", () => {
  it("computes a positive return", () => {
    const result = computeRoi({ cost: 100, endValue: 130 });
    expect(result.profit).toBe(30);
    expect(result.roiPct).toBeCloseTo(30, 10);
    expect(result.multiple).toBeCloseTo(1.3, 10);
  });

  it("computes a loss", () => {
    const result = computeRoi({ cost: 200, endValue: 150 });
    expect(result.profit).toBe(-50);
    expect(result.roiPct).toBeCloseTo(-25, 10);
  });

  it("handles breakeven", () => {
    const result = computeRoi({ cost: 100, endValue: 100 });
    expect(result.roiPct).toBe(0);
  });

  it("handles a total loss", () => {
    const result = computeRoi({ cost: 100, endValue: 0 });
    expect(result.roiPct).toBe(-100);
    expect(result.multiple).toBe(0);
  });

  it("rejects invalid inputs", () => {
    expect(() => computeRoi({ cost: 0, endValue: 100 })).toThrow(/cost/);
    expect(() => computeRoi({ cost: 100, endValue: -5 })).toThrow(/end value/);
  });
});
