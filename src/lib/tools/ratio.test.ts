import { describe, expect, it } from "vitest";
import { simplifyRatio } from "./ratio";

describe("simplifyRatio", () => {
  it("simplifies integer ratios", () => {
    expect(simplifyRatio(8, 12)).toMatchObject({ a: 2, b: 3, display: "2 : 3" });
  });

  it("handles decimals by scaling to integers", () => {
    const result = simplifyRatio(1.5, 2.5);
    expect(result).toMatchObject({ a: 3, b: 5, display: "3 : 5" });
  });

  it("keeps irreducible ratios", () => {
    expect(simplifyRatio(2, 3)).toMatchObject({ a: 2, b: 3, display: "2 : 3" });
  });

  it("handles a zero first value", () => {
    expect(simplifyRatio(0, 5)).toMatchObject({ a: 0, b: 1, display: "0 : 1", aPct: 0 });
  });

  it("computes share percentages", () => {
    const result = simplifyRatio(1, 3);
    expect(result.aPct).toBeCloseTo(25, 10);
    expect(result.bPct).toBeCloseTo(75, 10);
  });

  it("rejects invalid input", () => {
    expect(() => simplifyRatio(1, 0)).toThrow(/second value/);
    expect(() => simplifyRatio(0, 0)).toThrow(/more than 0/);
    expect(() => simplifyRatio(-1, 2)).toThrow(/0 or more/);
  });
});
