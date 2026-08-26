/**
 * Compound annual growth rate.
 */

export type CagrTerms = {
  startValue: number;
  endValue: number;
  years: number;
};

export type CagrResult = {
  cagrPct: number;
  totalReturnPct: number;
  multiplier: number;
};

export function computeCagr(terms: CagrTerms): CagrResult {
  const { startValue, endValue, years } = terms;
  if (!Number.isFinite(startValue) || startValue <= 0) {
    throw new Error("The start value must be more than 0.");
  }
  if (!Number.isFinite(endValue) || endValue < 0) {
    throw new Error("The end value must be 0 or more.");
  }
  if (!Number.isFinite(years) || years <= 0) throw new Error("The term must be more than 0 years.");
  if (endValue === 0) {
    return { cagrPct: -100, totalReturnPct: -100, multiplier: 0 };
  }
  const cagr = Math.pow(endValue / startValue, 1 / years) - 1;
  return {
    cagrPct: cagr * 100,
    totalReturnPct: ((endValue - startValue) / startValue) * 100,
    multiplier: endValue / startValue,
  };
}
