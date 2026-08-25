import { describe, expect, it } from "vitest";
import { diffDates, parseDateInput } from "./date-difference";

const utc = (iso: string) => parseDateInput(iso, "date");

describe("parseDateInput", () => {
  it("parses YYYY-MM-DD as UTC midnight", () => {
    expect(utc("2026-01-15").toISOString()).toBe("2026-01-15T00:00:00.000Z");
  });

  it("rejects non-ISO shapes with a readable message", () => {
    expect(() => parseDateInput("15/01/2026", "start date")).toThrow(/start date/);
  });

  it("rejects impossible calendar dates", () => {
    expect(() => parseDateInput("2026-02-30", "end date")).toThrow(/not a real calendar date/);
  });
});

describe("diffDates", () => {
  it("counts whole days, weeks and weekdays inclusively", () => {
    // 2026-01-05 is a Monday; the 5th through the 11th is one full week.
    const diff = diffDates(utc("2026-01-05"), utc("2026-01-11"));
    expect(diff.totalDays).toBe(6);
    expect(diff.weeks).toBe(0);
    expect(diff.weekRemainderDays).toBe(6);
    expect(diff.weekdays).toBe(5);
    expect(diff.weekendDays).toBe(2);
    expect(diff.startBeforeEnd).toBe(true);
  });

  it("breaks the difference down into calendar units people expect", () => {
    const diff = diffDates(utc("2026-01-15"), utc("2026-03-20"));
    // Jan 15 → Mar 20: 2 months and 5 days.
    expect(diff).toMatchObject({ years: 0, months: 2, days: 5 });
  });

  it("borrows from the previous month correctly", () => {
    // Jan 31 → Feb 28: "1 month" would overshoot, so it is 28 days.
    const diff = diffDates(utc("2026-01-31"), utc("2026-02-28"));
    expect(diff).toMatchObject({ months: 0, days: 28 });
  });

  it("handles same-day and reversed inputs", () => {
    expect(diffDates(utc("2026-05-05"), utc("2026-05-05")).totalDays).toBe(0);
    const reversed = diffDates(utc("2026-03-01"), utc("2026-02-01"));
    expect(reversed.totalDays).toBe(28);
    expect(reversed.startBeforeEnd).toBe(false);
  });

  it("spans years, including a leap day", () => {
    const diff = diffDates(utc("2023-06-01"), utc("2026-06-01"));
    expect(diff).toMatchObject({ years: 3, months: 0, days: 0 });
    expect(diff.totalDays).toBe(1096); // 3 × 365 + leap day 2024-02-29
  });
});
