import { describe, expect, it } from "vitest";
import { computeCagr } from "./cagr";

describe("computeCagr", () => {
  it("computes the standard CAGR", () => {
    const result = computeCagr({ startValue: 100, endValue: 200, years: 10 });
    // (200/100)^(1/10) - 1 = 2^0.1 - 1 ≈ 7.177%
    expect(result.cagrPct).toBeCloseTo(7.177346253629313, 9);
    expect(result.totalReturnPct).toBe(100);
    expect(result.multiplier).toBe(2);
  });

  it("handles one year (CAGR = total return)", () => {
    const result = computeCagr({ startValue: 100, endValue: 150, years: 1 });
    expect(result.cagrPct).toBe(50);
  });

  it("handles a decline", () => {
    const result = computeCagr({ startValue: 200, endValue: 100, years: 4 });
    expect(result.cagrPct).toBeCloseTo(-15.910358474628538, 9);
  });

  it("handles a total loss", () => {
    const result = computeCagr({ startValue: 100, endValue: 0, years: 5 });
    expect(result.cagrPct).toBe(-100);
  });

  it("rejects invalid inputs", () => {
    expect(() => computeCagr({ startValue: 0, endValue: 100, years: 5 })).toThrow(/start value/);
    expect(() => computeCagr({ startValue: 100, endValue: -1, years: 5 })).toThrow(/end value/);
    expect(() => computeCagr({ startValue: 100, endValue: 100, years: 0 })).toThrow(/term/);
  });
});
