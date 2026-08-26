import { describe, expect, it } from "vitest";
import { findReplace } from "./find-replace";

const options = { caseSensitive: true, useRegex: false } as const;

describe("literal mode", () => {
  it("replaces every occurrence and counts them", () => {
    const result = findReplace("foo bar foo baz foo", "foo", "qux", options);
    expect(result.output).toBe("qux bar qux baz qux");
    expect(result.replacements).toBe(3);
  });

  it("treats the find text as literal, not a pattern", () => {
    expect(findReplace("a.c abc", "a.c", "X", options).output).toBe("X abc");
  });

  it("honors case sensitivity", () => {
    const sensitive = findReplace("Cat cat", "cat", "feline", { caseSensitive: true, useRegex: false });
    expect(sensitive.output).toBe("Cat feline");
    const insensitive = findReplace("Cat cat", "cat", "feline", { caseSensitive: false, useRegex: false });
    expect(insensitive.output).toBe("feline feline");
  });

  it("counts zero matches without changing the text", () => {
    const result = findReplace("nothing here", "ghost", "x", options);
    expect(result.output).toBe("nothing here");
    expect(result.replacements).toBe(0);
  });

  it("requires a find term", () => {
    expect(() => findReplace("text", "", "x", options)).toThrow(/text to find/);
  });
});

describe("regex mode", () => {
  it("applies patterns with capture-group replacement", () => {
    const result = findReplace("a1 b22 c333", "(\\d+)", "[$1]", { caseSensitive: true, useRegex: true });
    expect(result.output).toBe("a[1] b[22] c[333]");
    expect(result.replacements).toBe(3);
  });

  it("supports $& for the whole match", () => {
    const result = findReplace("hello", "l+", "$&!", { caseSensitive: true, useRegex: true });
    expect(result.output).toBe("hell!o");
  });

  it("survives zero-width and empty matches without looping forever", () => {
    const result = findReplace("abc", "x?", "-", { caseSensitive: true, useRegex: true });
    expect(result.output).toBe("-a-b-c-");
  });

  it("rejects invalid patterns with a friendly message", () => {
    expect(() => findReplace("text", "(", "x", { caseSensitive: true, useRegex: true })).toThrow(
      /not a valid regular expression/,
    );
  });
});
