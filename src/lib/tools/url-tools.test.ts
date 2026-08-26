import { describe, expect, it } from "vitest";
import { buildQueryString, buildUtm, extractUtm, parseQueryString, parseUrl } from "./url-tools";

describe("parseUrl", () => {
  it("breaks a URL into components", () => {
    const result = parseUrl("https://example.com:8443/a/b?x=1&y=two#frag");
    expect(result.valid).toBe(true);
    expect(result.protocol).toBe("https");
    expect(result.hostname).toBe("example.com");
    expect(result.port).toBe("8443");
    expect(result.pathname).toBe("/a/b");
    expect(result.search).toBe("?x=1&y=two");
    expect(result.hash).toBe("#frag");
    expect(result.params).toEqual([
      { key: "x", value: "1" },
      { key: "y", value: "two" },
    ]);
  });

  it("suggests a protocol when missing", () => {
    const result = parseUrl("example.com/page");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/protocol/);
  });

  it("rejects empty input", () => {
    expect(parseUrl("").valid).toBe(false);
  });
});

describe("query strings", () => {
  it("builds a string in insertion order", () => {
    expect(buildQueryString([{ key: "b", value: "2" }, { key: "a", value: "1" }])).toBe("b=2&a=1");
  });

  it("sorts when asked and encodes values", () => {
    expect(buildQueryString([{ key: "b", value: "2" }, { key: "a", value: "1" }], { sort: true })).toBe("a=1&b=2");
    expect(buildQueryString([{ key: "q", value: "a b&c" }])).toBe("q=a%20b%26c");
  });

  it("skips empty pairs when asked", () => {
    expect(
      buildQueryString(
        [{ key: "a", value: "1" }, { key: "", value: "x" }, { key: "b", value: "" }],
        { skipEmpty: true },
      ),
    ).toBe("a=1");
  });

  it("round-trips through parseQueryString", () => {
    const built = buildQueryString([{ key: "a", value: "1 2" }, { key: "b", value: "x" }]);
    expect(parseQueryString(built)).toEqual([
      { key: "a", value: "1 2" },
      { key: "b", value: "x" },
    ]);
    expect(parseQueryString("?a=1")).toEqual([{ key: "a", value: "1" }]);
    expect(parseQueryString("")).toEqual([]);
  });
});

describe("UTM", () => {
  it("tags a URL with the provided fields", () => {
    const result = buildUtm("https://example.com/page", { source: "news", medium: "email", campaign: "launch" });
    expect(result.valid).toBe(true);
    expect(result.href).toBe("https://example.com/page?utm_source=news&utm_medium=email&utm_campaign=launch");
  });

  it("replaces existing UTM params and reports which", () => {
    const result = buildUtm(
      "https://example.com/page?utm_source=old&utm_medium=ref",
      { source: "news", medium: "email" },
    );
    expect(result.href).toBe("https://example.com/page?utm_source=news&utm_medium=email");
    expect(result.replaced).toEqual(["utm_source", "utm_medium"]);
  });

  it("keeps non-UTM params", () => {
    const result = buildUtm("https://example.com/page?id=7", { source: "news" });
    expect(result.href).toBe("https://example.com/page?id=7&utm_source=news");
  });

  it("rejects invalid base URLs", () => {
    expect(buildUtm("not a url", { source: "news" }).valid).toBe(false);
  });

  it("extracts UTM params from an existing URL", () => {
    const result = extractUtm("https://example.com/page?utm_source=news&utm_term=term&q=1");
    expect(result.valid).toBe(true);
    const byKey = Object.fromEntries(result.params.map((param) => [param.key, param]));
    expect(byKey.utm_source?.present).toBe(true);
    expect(byKey.utm_source?.value).toBe("news");
    expect(byKey.utm_campaign?.present).toBe(false);
    expect(byKey.utm_medium?.value).toBe("");
  });

  it("reports the URL error when extraction fails", () => {
    expect(extractUtm("nope").valid).toBe(false);
  });
});
