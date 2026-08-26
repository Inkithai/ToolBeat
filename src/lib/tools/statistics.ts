/**
 * Descriptive statistics for a list of numbers.
 */

export type Statistics = {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[] | null;
  min: number;
  max: number;
  range: number;
  variance: number;
  stdDev: number;
  sampleVariance: number | null;
  sampleStdDev: number | null;
};

export function computeStatistics(values: number[]): Statistics {
  if (values.length === 0) throw new Error("Provide at least one number.");
  const count = values.length;
  const sum = values.reduce((total, value) => total + value, 0);
  const mean = sum / count;
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(count / 2);
  const median = count % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const frequencies = new Map<number, number>();
  for (const value of values) frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  const maxFreq = Math.max(...frequencies.values());
  const modes = [...frequencies.entries()].filter(([, freq]) => freq === maxFreq).map(([value]) => value);
  const mode = maxFreq > 1 ? modes.sort((x, y) => x - y) : null;

  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / count;
  const sampleVariance = count > 1 ? variance * (count / (count - 1)) : null;

  return {
    count,
    sum,
    mean,
    median,
    mode,
    min: sorted[0],
    max: sorted[count - 1],
    range: sorted[count - 1] - sorted[0],
    variance,
    stdDev: Math.sqrt(variance),
    sampleVariance,
    sampleStdDev: sampleVariance === null ? null : Math.sqrt(sampleVariance),
  };
}

/** Split free text into numbers on commas, semicolons or whitespace. */
export function parseNumberList(text: string): { numbers: number[]; ignored: string[] } {
  const tokens = text.split(/[\s,;]+/).filter((token) => token !== "");
  const numbers: number[] = [];
  const ignored: string[] = [];
  for (const token of tokens) {
    if (/^-?\d+(\.\d+)?$/.test(token)) numbers.push(Number(token));
    else ignored.push(token);
  }
  return { numbers, ignored };
}
