import { describe, expect, it } from "vitest";
import { computeStatistics, parseNumberList } from "./statistics";

describe("computeStatistics", () => {
  it("computes core stats for an even sample", () => {
    const stats = computeStatistics([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(stats.count).toBe(8);
    expect(stats.sum).toBe(40);
    expect(stats.mean).toBe(5);
    expect(stats.median).toBe(4.5);
    expect(stats.min).toBe(2);
    expect(stats.max).toBe(9);
    expect(stats.range).toBe(7);
    expect(stats.mode).toEqual([4]);
  });

  it("computes variance and standard deviation", () => {
    const stats = computeStatistics([2, 4, 4, 4, 5, 5, 7, 9]);
    // Population variance: 4
    expect(stats.variance).toBeCloseTo(4, 10);
    expect(stats.stdDev).toBeCloseTo(2, 10);
    // Sample variance: n/(n-1) * population = 32/7
    expect(stats.sampleVariance).toBeCloseTo(32 / 7, 10);
    expect(stats.sampleStdDev).toBeCloseTo(Math.sqrt(32 / 7), 10);
  });

  it("handles an odd sample median", () => {
    expect(computeStatistics([1, 3, 5]).median).toBe(3);
  });

  it("returns no mode when everything is unique", () => {
    expect(computeStatistics([1, 2, 3]).mode).toBeNull();
  });

  it("handles bimodal data", () => {
    expect(computeStatistics([1, 1, 2, 2, 3]).mode).toEqual([1, 2]);
  });

  it("degrades sample stats for a single value", () => {
    const stats = computeStatistics([42]);
    expect(stats.mean).toBe(42);
    expect(stats.variance).toBe(0);
    expect(stats.sampleVariance).toBeNull();
  });

  it("rejects empty input", () => {
    expect(() => computeStatistics([])).toThrow(/at least one number/);
  });
});

describe("parseNumberList", () => {
  it("splits on commas, semicolons and whitespace", () => {
    const { numbers, ignored } = parseNumberList("1, 2.5; 3\n-4\tx");
    expect(numbers).toEqual([1, 2.5, 3, -4]);
    expect(ignored).toEqual(["x"]);
  });

  it("ignores empty tokens", () => {
    expect(parseNumberList("  1 , , 2 , ").numbers).toEqual([1, 2]);
  });
});
