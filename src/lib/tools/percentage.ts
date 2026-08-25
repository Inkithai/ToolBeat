/**
 * Percentage arithmetic, kept explicit because the three everyday percentage
 * questions are three different formulas that people routinely confuse.
 *
 * Results are exact numbers; formatting happens at the UI. A zero divisor
 * yields ±Infinity (JavaScript's rule) rather than a thrown error — the UI
 * checks `Number.isFinite` and decides how to explain it.
 */

/** "What is X% of Y?" */
export function percentOfValue(percentage: number, base: number): number {
  return (percentage / 100) * base;
}

/** "X is what percentage of Y?" ±Infinity when the total is 0. */
export function shareAsPercent(value: number, total: number): number {
  return (value / total) * 100;
}

/** Percentage change from `from` to `to`. ±Infinity when `from` is 0. */
export function percentChange(from: number, to: number): number {
  return ((to - from) / from) * 100;
}

/** Rounds to 2 decimals, keeping -0 away from display. */
export function roundTo2(value: number): number {
  return Object.is(value, -0) ? 0 : Math.round(value * 100) / 100;
}
