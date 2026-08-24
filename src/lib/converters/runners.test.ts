import { describe, expect, it } from "vitest";
import { CONVERSIONS, CONVERSION_ENTRIES, type ConversionType } from "@/constants/app";
import { CONVERSION_RUNNERS, getConversionRunner } from "./runners";

/**
 * The registry replaced a switch statement whose `default` branch threw at
 * runtime. These tests assert the property that made the replacement safe: the
 * mapping is total, so an advertised conversion can never reach a missing
 * implementation.
 */
describe("conversion runner registry", () => {
  it("implements every advertised conversion", () => {
    const advertised = Object.keys(CONVERSIONS).sort();
    expect(Object.keys(CONVERSION_RUNNERS).sort()).toEqual(advertised);
  });

  it("exposes a callable runner for each catalog entry", () => {
    for (const [type] of CONVERSION_ENTRIES) {
      expect(typeof getConversionRunner(type)).toBe("function");
    }
  });

  it("has no runner without a catalog entry, which would be dead code", () => {
    for (const type of Object.keys(CONVERSION_RUNNERS) as ConversionType[]) {
      expect(CONVERSIONS).toHaveProperty(type);
    }
  });
});

describe("text conversions produce correctly typed blobs", () => {
  /** Minimal File stand-in: the runners only ever call `.text()`. */
  const fileWith = (content: string) => ({ text: async () => content }) as unknown as File;

  const options = {
    pdfFontFamily: "Arial, sans-serif",
    pageSize: "A4" as const,
    imageQuality: 90,
    title: "example",
  };

  it("json-to-yaml emits YAML with the right MIME type", async () => {
    const blob = await getConversionRunner("json-to-yaml")(fileWith('{"a":1}'), options);
    expect(blob.type).toBe("application/yaml;charset=utf-8");
    expect(await blob.text()).toContain("a: 1");
  });

  it("csv-to-json emits JSON", async () => {
    const blob = await getConversionRunner("csv-to-json")(fileWith("a,b\n1,2"), options);
    expect(blob.type).toBe("application/json;charset=utf-8");
    expect(JSON.parse(await blob.text())).toEqual([{ a: "1", b: "2" }]);
  });

  it("propagates converter errors instead of producing an empty file", async () => {
    await expect(getConversionRunner("json-to-csv")(fileWith("{}"), options)).rejects.toThrow(
      /array of objects/i
    );
  });
});
