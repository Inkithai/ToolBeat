import { describe, expect, it } from "vitest";
import { validateXml } from "./validate-xml";

describe("validateXml", () => {
  it("accepts well-formed documents", () => {
    const result = validateXml('<root><a>1</a><b attr="x"/></root>');
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("accepts documents with declarations and CDATA", () => {
    const result = validateXml('<?xml version="1.0"?><root><![CDATA[<not xml>]]></root>');
    expect(result.valid).toBe(true);
  });

  it("reports mismatched closing tags with line and column", () => {
    const result = validateXml("<root>\n  <a>1</a>\n</root-wrong>");
    expect(result.valid).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.message).toMatch(/root/);
    expect(result.issues[0]?.line).toBeGreaterThan(0);
  });

  it("reports unclosed tags", () => {
    const result = validateXml("<root><a>1</root>");
    expect(result.valid).toBe(false);
    expect(result.issues[0]?.message).toBeTruthy();
  });

  it("rejects empty input", () => {
    expect(validateXml("   ").valid).toBe(false);
  });

  it("flags boolean attributes unless allowed", () => {
    expect(validateXml("<a x/>").valid).toBe(false);
    expect(validateXml("<a x/>", { allowBooleanAttributes: true }).valid).toBe(true);
  });

  it("honors unpaired tags", () => {
    expect(validateXml("<root><br></root>").valid).toBe(false);
    expect(validateXml("<root><br></root>", { unpairedTags: ["br"] }).valid).toBe(true);
  });
});
