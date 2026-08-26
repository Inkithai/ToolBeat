/**
 * Return on investment.
 */

export type RoiTerms = {
  /** What was invested. */
  cost: number;
  /** What it is worth now (or the total return). */
  endValue: number;
};

export type RoiResult = {
  profit: number;
  roiPct: number;
  multiple: number;
};

export function computeRoi(terms: RoiTerms): RoiResult {
  const { cost, endValue } = terms;
  if (!Number.isFinite(cost) || cost <= 0) throw new Error("The investment cost must be more than 0.");
  if (!Number.isFinite(endValue) || endValue < 0) throw new Error("The end value must be 0 or more.");
  const profit = endValue - cost;
  return {
    profit,
    roiPct: (profit / cost) * 100,
    multiple: endValue / cost,
  };
}
