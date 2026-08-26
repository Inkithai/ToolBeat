import { describe, expect, it } from "vitest";
import { investmentForecast } from "./investment";

describe("investmentForecast", () => {
  it("grows a deposit with no contributions", () => {
    const result = investmentForecast({ initial: 1000, monthly: 0, annualRatePct: 12, years: 1 });
    // 12 months of 1% monthly compounding: 1000 * 1.01^12
    expect(result.finalValue).toBeCloseTo(1000 * 1.01 ** 12, 6);
    expect(result.totalContributed).toBe(1000);
    expect(result.totalGrowth).toBeCloseTo(result.finalValue - 1000, 6);
  });

  it("adds contributions at month end", () => {
    const result = investmentForecast({ initial: 0, monthly: 100, annualRatePct: 0, years: 1 });
    expect(result.finalValue).toBe(1200);
    expect(result.totalContributed).toBe(1200);
    expect(result.totalGrowth).toBe(0);
  });

  it("computes the standard FV of an annuity", () => {
    // 100/month at 12% for 5 years: FV = 100 * (((1.01)^60 - 1) / 0.01)
    const result = investmentForecast({ initial: 0, monthly: 100, annualRatePct: 12, years: 5 });
    const expected = 100 * ((1.01 ** 60 - 1) / 0.01);
    expect(result.finalValue).toBeCloseTo(expected, 4);
  });

  it("emits one row per year that reconciles", () => {
    const result = investmentForecast({ initial: 5000, monthly: 200, annualRatePct: 6, years: 3 });
    expect(result.years).toHaveLength(3);
    for (const row of result.years) {
      expect(row.endValue).toBeCloseTo(row.startValue + row.contributions + row.growth, 6);
    }
    // Sum of yearly contributions equals the total.
    const contributions = result.years.reduce((sum, row) => sum + row.contributions, 0);
    expect(contributions).toBeCloseTo(7200, 6);
    // First year starts at the deposit.
    expect(result.years[0]?.startValue).toBe(5000);
    // Last year ends at the final value.
    expect(result.years[result.years.length - 1]?.endValue).toBeCloseTo(result.finalValue, 6);
  });

  it("rejects invalid terms", () => {
    expect(() => investmentForecast({ initial: -1, monthly: 0, annualRatePct: 1, years: 1 })).toThrow(/initial/);
    expect(() => investmentForecast({ initial: 0, monthly: 0, annualRatePct: 1, years: 0 })).toThrow(/term/);
    expect(() => investmentForecast({ initial: 0, monthly: 0, annualRatePct: 150, years: 1 })).toThrow(/rate/);
  });
});
