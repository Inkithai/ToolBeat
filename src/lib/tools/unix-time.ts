/**
 * Unix timestamp conversion, both directions.
 *
 * Pure date math only — the UI renders what comes back. UTC strings are
 * deterministic (testable); local rendering is left to the browser.
 */

export type UnixInfo = {
  /** Unix timestamp in seconds. */
  seconds: number;
  milliseconds: number;
  /** Deterministic UTC rendering, e.g. 2023-11-14T22:13:20Z. */
  utc: string;
  /** ISO 8601 with offset. */
  iso: string;
};

export function unixToInfo(value: number, inputUnit: "seconds" | "milliseconds" = "seconds"): UnixInfo {
  if (!Number.isFinite(value)) throw new Error("Enter a valid number.");
  const milliseconds = inputUnit === "seconds" ? value * 1000 : value;
  if (!Number.isFinite(milliseconds) || Math.abs(milliseconds) > 8.64e15) {
    throw new Error("That timestamp is outside the representable date range.");
  }
  const date = new Date(milliseconds);
  return {
    seconds: Math.floor(value),
    milliseconds: Math.round(milliseconds),
    utc: date.toISOString().replace(".000Z", "Z"),
    iso: date.toISOString(),
  };
}

export function dateToUnix(isoDate: string, outputUnit: "seconds" | "milliseconds"): number {
  const milliseconds = Date.parse(isoDate);
  if (Number.isNaN(milliseconds)) throw new Error("Enter a valid date and time.");
  return outputUnit === "seconds" ? Math.floor(milliseconds / 1000) : milliseconds;
}

/** Human duration between two unix timestamps (seconds). */
export function describeDuration(fromSeconds: number, toSeconds: number): string {
  let ms = Math.abs(toSeconds - fromSeconds) * 1000;
  const units: Array<[number, string]> = [
    [31536000000, "year"],
    [2592000000, "month"],
    [604800000, "week"],
    [86400000, "day"],
    [3600000, "hour"],
    [60000, "minute"],
    [1000, "second"],
  ];
  const parts: string[] = [];
  for (const [size, label] of units) {
    const count = Math.floor(ms / size);
    if (count >= 1) {
      parts.push(`${count} ${label}${count === 1 ? "" : "s"}`);
      ms -= count * size;
    }
    if (parts.length === 2) break;
  }
  if (!parts.length) parts.push(ms > 0 ? `${ms} ms` : "0 seconds");
  return parts.join(" ");
}
