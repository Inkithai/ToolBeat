import { describe, expect, it } from "vitest";
import { loremText, makeRng } from "./lorem";

describe("loremText", () => {
  it("generates the requested number of paragraphs", () => {
    const output = loremText("paragraphs", 3, 42);
    expect(output.trim().split(/\n\n+/)).toHaveLength(3);
  });

  it("generates at least the requested number of sentences", () => {
    const output = loremText("sentences", 5, 7);
    expect(output.match(/[^.]*\./g)?.length ?? 0).toBeGreaterThanOrEqual(5);
  });

  it("generates at least the requested number of words", () => {
    const output = loremText("words", 20, 99);
    expect(output.trim().split(/\s+/)).toHaveLength(20);
  });

  it("is deterministic for a fixed seed", () => {
    expect(loremText("paragraphs", 2, 1234)).toBe(loremText("paragraphs", 2, 1234));
  });

  it("differs across seeds", () => {
    expect(loremText("paragraphs", 2, 1)).not.toBe(loremText("paragraphs", 2, 2));
  });

  it("caps the count", () => {
    const output = loremText("words", 500, 5);
    expect(output.trim().split(/\s+/)).toHaveLength(100);
  });

  it("rejects non-positive counts", () => {
    expect(() => loremText("words", 0, 1)).toThrow(/at least one/);
    expect(() => loremText("words", -3, 1)).toThrow(/at least one/);
  });
});

describe("makeRng", () => {
  it("stays in [0, 1) and is reproducible", () => {
    const a = makeRng(7);
    const first = Array.from({ length: 10 }, () => a());
    const b = makeRng(7);
    const again = Array.from({ length: 10 }, () => b());
    expect(first).toEqual(again);
    for (const value of first) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
