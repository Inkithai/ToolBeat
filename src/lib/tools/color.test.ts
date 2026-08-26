import { describe, expect, it } from "vitest";
import { contrastRatio, hslToHex, parseHex, rgbToHex, rgbToHsl } from "./color";

describe("parseHex", () => {
  it("parses long and short hex", () => {
    expect(parseHex("#6366f1")).toEqual({ r: 99, g: 102, b: 241 });
    expect(parseHex("fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex("000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("rejects invalid input", () => {
    expect(() => parseHex("nope")).toThrow(/hex color/);
    expect(() => parseHex("#12345")).toThrow(/hex color/);
  });
});

describe("rgbToHex", () => {
  it("round-trips with parseHex", () => {
    expect(rgbToHex({ r: 99, g: 102, b: 241 })).toBe("#6366f1");
  });

  it("clamps out-of-range channels", () => {
    expect(rgbToHex({ r: 300, g: -5, b: 128 })).toBe("#ff0080");
  });
});

describe("HSL round trips", () => {
  it("converts pure red to HSL and back", () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe("#ff0000");
  });

  it("converts white and black", () => {
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 });
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
    expect(hslToHex({ h: 0, s: 0, l: 0 })).toBe("#000000");
  });

  it("round-trips a mid tone within rounding tolerance", () => {
    const source = { r: 99, g: 102, b: 241 };
    const hsl = rgbToHsl(source);
    const back = parseHex(hslToHex(hsl));
    expect(Math.abs(back.r - source.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.g - source.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.b - source.b)).toBeLessThanOrEqual(2);
  });
});

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
  });

  it("is 1 for identical colors", () => {
    expect(contrastRatio("#6366f1", "#6366f1")).toBe(1);
  });

  it("is order-independent", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBe(21);
  });
});
