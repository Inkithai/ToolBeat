import { describe, expect, it } from "vitest";
import { transformLines } from "./line-tools";

describe("transformLines", () => {
  it("returns lines unchanged by default", () => {
    expect(transformLines("a\nb\nc")).toEqual(["a", "b", "c"]);
  });

  it("sorts alphabetically", () => {
    expect(transformLines("banana\napple\ncherry", { sort: "asc" })).toEqual(["apple", "banana", "cherry"]);
    expect(transformLines("banana\napple\ncherry", { sort: "desc" })).toEqual(["cherry", "banana", "apple"]);
  });

  it("respects case sensitivity", () => {
    const lines = "banana\nApple\ncherry";
    expect(transformLines(lines, { sort: "asc", caseInsensitive: true })).toEqual(["Apple", "banana", "cherry"]);
    expect(transformLines(lines, { sort: "asc", caseInsensitive: false })).toEqual(["Apple", "banana", "cherry"]);
  });

  it("sorts naturally with numbers", () => {
    const lines = "item10\nitem2\nitem1";
    expect(transformLines(lines, { sort: "natural-asc" })).toEqual(["item1", "item2", "item10"]);
    expect(transformLines(lines, { sort: "natural-desc" })).toEqual(["item10", "item2", "item1"]);
    // Plain lexicographic keeps 10 before 2.
    expect(transformLines(lines, { sort: "asc" })).toEqual(["item1", "item10", "item2"]);
  });

  it("dedupes case-insensitively by default", () => {
    expect(transformLines("Apple\napple\nAPPLE\nbanana", { dedupe: true })).toEqual(["Apple", "banana"]);
  });

  it("removes blank lines", () => {
    expect(transformLines("a\n\n   \nb\n\n", { removeBlank: true })).toEqual(["a", "b"]);
  });

  it("trims lines", () => {
    expect(transformLines("  a  \n  b\n", { trim: true })).toEqual(["a", "b"]);
  });

  it("combines options in a stable order", () => {
    const lines = "  banana\n\napple\n  APPLE\nbanana";
    const result = transformLines(lines, { trim: true, removeBlank: true, sort: "asc", dedupe: true });
    expect(result).toEqual(["apple", "banana"]);
  });
});
