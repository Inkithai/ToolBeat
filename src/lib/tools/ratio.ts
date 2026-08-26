/**
 * Ratio simplification and share percentages.
 */

export type RatioResult = {
  a: number;
  b: number;
  display: string;
  aPct: number;
  bPct: number;
};

function gcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function simplifyRatio(a: number, b: number): RatioResult {
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error("Both values must be numbers.");
  if (a < 0 || b < 0) throw new Error("Both values must be 0 or more.");
  if (a === 0 && b === 0) throw new Error("At least one value must be more than 0.");
  if (b === 0) throw new Error("The second value must be more than 0 to form a ratio.");

  // Scale to integers (up to 6 decimal places of input precision).
  const decimals = Math.max(
    0,
    ...[a, b].map((value) => {
      const match = String(value).match(/\.(\d+)/);
      return match ? Math.min(match[1].length, 6) : 0;
    }),
  );
  const scale = 10 ** decimals;
  let ai = Math.round(a * scale);
  let bi = Math.round(b * scale);
  const divisor = gcd(ai, bi);
  ai /= divisor;
  bi /= divisor;

  return {
    a: ai,
    b: bi,
    display: `${ai} : ${bi}`,
    aPct: (a / (a + b)) * 100,
    bPct: (b / (a + b)) * 100,
  };
}
