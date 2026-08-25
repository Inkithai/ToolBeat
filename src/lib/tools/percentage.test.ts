import { describe, expect, it } from "vitest";
import { percentChange, percentOfValue, roundTo2, shareAsPercent } from "./percentage";

describe("percentOfValue", () => {
  it("answers 'what is X% of Y'", () => {
    expect(percentOfValue(15, 200)).toBe(30);
    expect(percentOfValue(12.5, 80)).toBe(10);
  });

  it("handles percentages over 100 and negative values", () => {
    expect(percentOfValue(150, 10)).toBe(15);
    expect(percentOfValue(-50, 10)).toBe(-5);
  });
});

describe("shareAsPercent", () => {
  it("answers 'X is what % of Y'", () => {
    expect(shareAsPercent(30, 200)).toBe(15);
  });

  it("is infinite for a zero total rather than throwing", () => {
    expect(Number.isFinite(shareAsPercent(5, 0))).toBe(false);
    expect(shareAsPercent(5, 0)).toBe(Infinity);
  });
});

describe("percentChange", () => {
  it("computes increase and decrease", () => {
    expect(percentChange(80, 100)).toBe(25);
    expect(percentChange(100, 80)).toBe(-20);
  });

  it("is infinite from a zero baseline", () => {
    expect(percentChange(0, 10)).toBe(Infinity);
  });
});

describe("roundTo2", () => {
  it("rounds to two decimals and normalizes -0", () => {
    expect(roundTo2(3.14159)).toBe(3.14);
    expect(roundTo2(2.005)).toBe(2.01);
    expect(roundTo2(-0.001)).toBe(-0);
    expect(roundTo2(-0)).toBe(0);
  });
});
