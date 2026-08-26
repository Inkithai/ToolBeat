import { describe, expect, it } from "vitest";
import { decodeHtml, encodeHtml } from "./html-entities";

describe("encodeHtml", () => {
  it("encodes the five special characters by default (numeric refs)", async () => {
    await expect(encodeHtml(`<a href="x">Tom & Jerry's</a>`)).resolves.toBe(
      "&#x3C;a href=&#x22;x&#x22;&#x3E;Tom &#x26; Jerry&#x27;s&#x3C;/a&#x3E;",
    );
  });

  it("encodes the five special characters with named refs", async () => {
    await expect(encodeHtml(`<a href="x">Tom & Jerry's</a>`, { useNamedReferences: true })).resolves.toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;",
    );
  });

  it("uses named references when asked", async () => {
    await expect(encodeHtml("Tom & Jerry", { useNamedReferences: true })).resolves.toBe("Tom &amp; Jerry");
  });

  it("encodes everything at level=all", async () => {
    await expect(encodeHtml("café ✓", { level: "all" })).resolves.not.toContain("café");
    const out = await encodeHtml("café", { level: "all" });
    expect(out).toMatch(/&#x?/);
  });

  it("passes through clean text", async () => {
    await expect(encodeHtml("plain text 123")).resolves.toBe("plain text 123");
  });
});

describe("decodeHtml", () => {
  it("decodes named and numeric references", async () => {
    await expect(decodeHtml("Tom &amp; Jerry &#128512; &#x2713;")).resolves.toBe("Tom & Jerry 😀 ✓");
  });

  it("treats &quot; as a plain quote in attribute mode", async () => {
    await expect(decodeHtml("a &quot; b", true)).resolves.toBe('a " b');
  });

  it("keeps bare ampersands", async () => {
    await expect(decodeHtml("Tom & Jerry")).resolves.toBe("Tom & Jerry");
  });
});
