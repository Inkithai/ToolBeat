import { describe, expect, it } from "vitest";
import { escapeUnicode, inspectUnicode, unescapeUnicode } from "./unicode-escapes";

describe("escapeUnicode", () => {
  it("leaves printable ASCII alone", () => {
    expect(escapeUnicode("hello world 123")).toBe("hello world 123");
  });

  it("escapes non-ASCII characters", () => {
    expect(escapeUnicode("café")).toBe("caf\\u00E9");
    expect(escapeUnicode("✓")).toBe("\\u2713");
  });

  it("escapes control characters, backslash and quote", () => {
    expect(escapeUnicode("a\nb\\c\"d")).toBe("a\\u000Ab\\u005Cc\\u0022d");
  });

  it("handles emoji via surrogate pairs", () => {
    const escaped = escapeUnicode("😀");
    expect(escaped).toBe("\\uD83D\\uDE00");
    expect(unescapeUnicode(escaped)).toBe("😀");
  });

  it("is idempotent once escaped", () => {
    const once = escapeUnicode("café ✓");
    expect(unescapeUnicode(once)).toBe("café ✓");
  });
});

describe("unescapeUnicode", () => {
  it("decodes \\u and \\x escapes", () => {
    expect(unescapeUnicode("\\u0041\\x42")).toBe("AB");
    expect(unescapeUnicode("\\u00E9")).toBe("é");
  });

  it("decodes named escapes", () => {
    expect(unescapeUnicode("a\\nb\\tc\\\"d\\\\e")).toBe('a\nb\tc"d\\e');
  });

  it("keeps unknown escapes intact", () => {
    expect(unescapeUnicode("a\\qb")).toBe("a\\qb");
  });
});

describe("inspectUnicode", () => {
  it("lists unique characters in order of appearance", () => {
    const info = inspectUnicode("ab a é ✓ ab");
    expect(info.map((entry) => entry.char)).toEqual(["a", "b", " ", "é", "✓"]);
    expect(info[0]?.codePoint).toBe("U+0061");
    expect(info.find((entry) => entry.char === "✓")?.codePoint).toBe("U+2713");
  });

  it("computes UTF-8 byte lengths", () => {
    const info = inspectUnicode("aé✓😀");
    expect(info.map((entry) => entry.utf8Bytes)).toEqual([1, 2, 3, 4]);
  });

  it("flags ASCII", () => {
    const info = inspectUnicode("aé");
    expect(info[0]?.isAscii).toBe(true);
    expect(info[1]?.isAscii).toBe(false);
  });
});
