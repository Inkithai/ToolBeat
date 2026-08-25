import { describe, expect, it } from "vitest";
import { decodeUrl, encodeUrl } from "./url-codec";

describe("encodeUrl", () => {
  it("component mode escapes structural characters and spaces", () => {
    expect(encodeUrl("a b&c=d?e/f", "component")).toBe("a%20b%26c%3Dd%3Fe%2Ff");
  });

  it("uri mode keeps a whole URL's separators intact", () => {
    expect(encodeUrl("https://example.com/a b?x=1&y=2", "uri")).toBe(
      "https://example.com/a%20b?x=1&y=2",
    );
  });
});

describe("decodeUrl", () => {
  it("round-trips both modes", () => {
    const value = "café & spices / 100%";
    expect(decodeUrl(encodeUrl(value, "component"), "component")).toBe(value);
    expect(decodeUrl(encodeUrl("https://ex.com/a b", "uri"), "uri")).toBe("https://ex.com/a b");
  });

  it("throws a readable error for malformed input", () => {
    expect(() => decodeUrl("100%", "component")).toThrow(/not a valid percent-encoded/);
  });
});
