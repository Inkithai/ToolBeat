// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderBarcode, BARCODE_FORMATS } from "./barcode";

// jsdom has no canvas implementation; jsbarcode measures text through a 2D
// context, so stub just that.
HTMLCanvasElement.prototype.getContext = (function getContext() {
  return {
    font: "",
    measureText: (text: string) => ({ width: text.length * 8 }),
  };
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

describe("renderBarcode", () => {
  it("renders Code 128 for arbitrary text", async () => {
    const result = await renderBarcode("CONVERTLAB-42", "CODE128");
    expect(result.svg).toContain("<svg");
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it("renders Code 39 for uppercase text", async () => {
    const result = await renderBarcode("ABC 123", "CODE39");
    expect(result.svg).toContain("<svg");
  });

  it("renders EAN-13 for 13 digits", async () => {
    const result = await renderBarcode("5901234123457", "EAN13");
    expect(result.svg).toContain("<svg");
  });

  it("rejects wrong-length EAN values with a friendly message", async () => {
    await expect(renderBarcode("12345", "EAN13")).rejects.toThrow(/EAN13/);
  });

  it("uppercases Code 39 input (its character set is uppercase)", async () => {
    const result = await renderBarcode("abc 123", "CODE39");
    expect(result.svg).toContain("ABC 123");
  });

  it("rejects illegal characters for Code 39", async () => {
    await expect(renderBarcode("a@b", "CODE39")).rejects.toThrow(/characters/);
  });

  it("rejects empty values", async () => {
    await expect(renderBarcode("   ", "CODE128")).rejects.toThrow(/first/);
  });

  it("honours size options", async () => {
    const small = await renderBarcode("TEST", "CODE128", { height: 32, moduleWidth: 1 });
    const big = await renderBarcode("TEST", "CODE128", { height: 96, moduleWidth: 3 });
    expect(big.height).toBeGreaterThan(small.height);
    expect(big.width).toBeGreaterThan(small.width);
  });

  it("exposes the format catalog", () => {
    expect(BARCODE_FORMATS.map((format) => format.value)).toContain("CODE128");
    expect(BARCODE_FORMATS.length).toBeGreaterThanOrEqual(4);
  });
});
