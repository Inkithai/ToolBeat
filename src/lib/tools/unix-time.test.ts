import { describe, expect, it } from "vitest";
import { dateToUnix, describeDuration, unixToInfo } from "./unix-time";

describe("unixToInfo", () => {
  it("converts 1700000000 seconds to the known UTC instant", () => {
    const info = unixToInfo(1700000000);
    expect(info.utc).toBe("2023-11-14T22:13:20Z");
    expect(info.milliseconds).toBe(1700000000000);
  });

  it("accepts millisecond input", () => {
    const info = unixToInfo(1700000000123, "milliseconds");
    expect(info.utc).toBe("2023-11-14T22:13:20.123Z");
  });

  it("handles epoch zero and negative timestamps", () => {
    expect(unixToInfo(0).utc).toBe("1970-01-01T00:00:00Z");
    expect(unixToInfo(-1).utc).toBe("1969-12-31T23:59:59Z");
  });

  it("rejects invalid and out-of-range input", () => {
    expect(() => unixToInfo(Number.NaN)).toThrow(/valid number/);
    expect(() => unixToInfo(1e18)).toThrow(/representable/);
  });
});

describe("dateToUnix", () => {
  it("round-trips with unixToInfo", () => {
    const seconds = dateToUnix("2023-11-14T22:13:20Z", "seconds");
    expect(seconds).toBe(1700000000);
    const milliseconds = dateToUnix("2023-11-14T22:13:20.500Z", "milliseconds");
    expect(milliseconds).toBe(1700000000500);
  });

  it("rejects unparseable dates", () => {
    expect(() => dateToUnix("not a date", "seconds")).toThrow(/valid date/);
  });
});

describe("describeDuration", () => {
  it("picks the two largest units", () => {
    expect(describeDuration(0, 31622401)).toBe("1 year 1 day");
    expect(describeDuration(1000, 1060)).toBe("1 minute");
    expect(describeDuration(1000, 1005)).toBe("5 seconds");
    expect(describeDuration(5, 5)).toBe("0 seconds");
  });
});
