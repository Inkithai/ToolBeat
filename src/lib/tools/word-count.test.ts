import { describe, expect, it } from "vitest";
import { analyzeText } from "./word-count";

describe("analyzeText", () => {
  it("reports zeroes for empty input", () => {
    expect(analyzeText("")).toEqual({
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingMinutes: 0,
    });
  });

  it("treats whitespace-only input as empty", () => {
    expect(analyzeText("   \n\n  ").words).toBe(0);
  });

  it("counts words separated by any whitespace", () => {
    expect(analyzeText("one two\tthree\nfour").words).toBe(4);
  });

  it("does not split hyphenated or apostrophised words", () => {
    expect(analyzeText("state-of-the-art doesn't").words).toBe(2);
  });

  it("counts characters with and without whitespace", () => {
    const stats = analyzeText("a b\nc");
    expect(stats.characters).toBe(5);
    expect(stats.charactersNoSpaces).toBe(3);
  });

  it("counts sentences across all terminators", () => {
    expect(analyzeText("One. Two! Three?").sentences).toBe(3);
  });

  it("treats consecutive terminators as one sentence", () => {
    expect(analyzeText("Really?! Yes...").sentences).toBe(2);
  });

  it("counts a final sentence with no terminator", () => {
    expect(analyzeText("No full stop here").sentences).toBe(1);
  });

  it("splits paragraphs on blank lines, not single newlines", () => {
    expect(analyzeText("One\nstill one\n\nTwo").paragraphs).toBe(2);
  });

  it("rounds reading time up to at least one minute", () => {
    expect(analyzeText("short text").readingMinutes).toBe(1);
    expect(analyzeText(Array.from({ length: 500 }, () => "word").join(" ")).readingMinutes).toBe(3);
  });
});
