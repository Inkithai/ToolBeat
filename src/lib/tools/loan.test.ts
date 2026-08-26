import { describe, expect, it } from "vitest";
import { amortizationByYear, formatMoney, loanSummary } from "./loan";

describe("loanSummary", () => {
  it("computes the standard EMI for a 100,000 loan at 12% over 5 years", () => {
    const summary = loanSummary({ principal: 100000, annualRatePct: 12, years: 5 });
    // r = 0.01, n = 60 → payment ≈ 2224.44
    expect(summary.monthlyPayment).toBeCloseTo(2224.44, 1);
    expect(summary.months).toBe(60);
    expect(summary.totalPaid).toBeCloseTo(133466.69, 0);
    expect(summary.totalInterest).toBeCloseTo(33466.69, 0);
  });

  it("handles zero interest as straight division", () => {
    const summary = loanSummary({ principal: 1200, annualRatePct: 0, years: 1 });
    expect(summary.monthlyPayment).toBe(100);
    expect(summary.totalInterest).toBe(0);
  });

  it("rejects invalid terms", () => {
    expect(() => loanSummary({ principal: 0, annualRatePct: 5, years: 1 })).toThrow(/greater than zero/);
    expect(() => loanSummary({ principal: 1000, annualRatePct: -1, years: 1 })).toThrow(/zero or more/);
    expect(() => loanSummary({ principal: 1000, annualRatePct: 5, years: 0 })).toThrow(/at least one month/);
  });

  it("rounds fractional-year terms to whole months", () => {
    const summary = loanSummary({ principal: 1000, annualRatePct: 6, years: 0.5 });
    expect(summary.months).toBe(6);
  });
});

describe("amortizationByYear", () => {
  it("amortizes the full balance over the term", () => {
    const rows = amortizationByYear({ principal: 1200, annualRatePct: 0, years: 1 });
    expect(rows).toHaveLength(1);
    expect(rows[0].principalThisYear).toBeCloseTo(1200, 6);
    expect(rows[0].balanceAfter).toBe(0);
  });

  it("front-loads interest in year one", () => {
    const rows = amortizationByYear({ principal: 100000, annualRatePct: 12, years: 5 });
    expect(rows).toHaveLength(5);
    expect(rows[0].interestThisYear).toBeGreaterThan(9000);
    expect(rows[0].balanceAfter).toBeLessThan(100000);
    expect(rows[4].balanceAfter).toBeCloseTo(0, 0);
  });
});

describe("formatMoney", () => {
  it("groups digits and keeps two decimals", () => {
    expect(formatMoney(1234567.8)).toBe("1,234,567.80");
  });
});
