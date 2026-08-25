import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "./relative-time";

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-08-25T12:00:00.000Z");

  it("describes minutes, yesterday and calendar dates", () => {
    expect(formatRelativeTime(now - 30_000, now)).toBe("just now");
    expect(formatRelativeTime(now - 2 * 60_000, now)).toBe("2 minutes ago");
    expect(formatRelativeTime(now - 26 * 60 * 60_000, now)).toBe("Yesterday");
    expect(formatRelativeTime(now - 10 * 24 * 60 * 60_000, now)).toMatch(/[A-Za-z]{3} \d{1,2}/);
  });

  it("returns empty for missing stamps", () => {
    expect(formatRelativeTime(0, now)).toBe("");
  });
});
