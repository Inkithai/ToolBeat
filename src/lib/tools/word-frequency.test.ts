import { describe, expect, it } from "vitest";
import { wordFrequency } from "./word-frequency";

const TEXT = "The quick brown fox. The quick brown fox jumps over the lazy dog. The fox!";

describe("wordFrequency", () => {
  it("counts words case-insensitively by default", () => {
    const result = wordFrequency(TEXT);
    expect(result.entries[0]?.word).toBe("the");
    expect(result.entries[0]?.count).toBe(4);
    expect(result.entries[0]?.pct).toBeCloseTo((4 / 15) * 100, 6);
  });

  it("reports totals and uniqueness", () => {
    const result = wordFrequency(TEXT);
    expect(result.total).toBe(15);
    expect(result.unique).toBe(8);
  });

  it("distinguishes case when asked", () => {
    const result = wordFrequency(TEXT, { caseInsensitive: false });
    const byWord = Object.fromEntries(result.entries.map((entry) => [entry.word, entry.count]));
    expect(byWord["The"]).toBe(3);
    expect(byWord["the"]).toBe(1);
  });

  it("applies the minimum length filter", () => {
    const result = wordFrequency("a a a bb bb ccc", { minLength: 2 });
    expect(result.entries.map((entry) => entry.word)).toEqual(["bb", "ccc"]);
  });

  it("limits to the top N and ties alphabetically", () => {
    const result = wordFrequency("z z a a m m", { topN: 2, minLength: 1 });
    expect(result.entries).toHaveLength(2);
    expect(result.entries.map((entry) => entry.word)).toEqual(["a", "m"]);
  });

  it("handles empty input", () => {
    const result = wordFrequency("");
    expect(result.entries).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("keeps apostrophes inside words", () => {
    const result = wordFrequency("it's it's IT'S", { minLength: 1 });
    expect(result.entries[0]?.word).toBe("it's");
    expect(result.entries[0]?.count).toBe(3);
  });
});
