import { describe, expect, it } from "vitest";
import { formatClock, formatLapDelta } from "./time-format";

describe("formatClock", () => {
  it("starts at 00:00.00", () => {
    expect(formatClock(0)).toBe("00:00.00");
  });

  it("formats minutes, seconds and centiseconds", () => {
    expect(formatClock(65250)).toBe("01:05.25");
    expect(formatClock(599990)).toBe("09:59.99");
  });

  it("adds an hour prefix past one hour", () => {
    expect(formatClock(3600000)).toBe("1:00:00.00");
    expect(formatClock(3723400)).toBe("1:02:03.40");
  });

  it("rejects invalid values", () => {
    expect(formatClock(Number.NaN)).toBe("00:00.00");
    expect(formatClock(-1)).toBe("00:00.00");
  });
});

describe("formatLapDelta", () => {
  it("formats seconds and minutes", () => {
    expect(formatLapDelta(5000)).toBe("5s");
    expect(formatLapDelta(83000)).toBe("1m 23s");
    expect(formatLapDelta(0)).toBe("0s");
    expect(formatLapDelta(Number.NaN)).toBe("0s");
  });
});
