import { describe, expect, it } from "vitest";
import { generatePalette, PALETTE_SCHEMES } from "./color-palette";

describe("generatePalette", () => {
  it("returns five valid hex colors", () => {
    const palette = generatePalette("#6366f1", "complementary");
    expect(palette).toHaveLength(5);
    for (const color of palette) expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("keeps the base color in the palette", () => {
    for (const scheme of PALETTE_SCHEMES) {
      const palette = generatePalette("#6366f1", scheme.value);
      expect(palette).toContain("#6366f1");
    }
  });

  it("is deterministic", () => {
    expect(generatePalette("#6366f1", "triadic")).toEqual(generatePalette("#6366f1", "triadic"));
  });

  it("rotates hue for analogous palettes", () => {
    const palette = generatePalette("#ff0000", "analogous");
    // Pure red is hue 0; analogous neighbors shift ±15/±30 degrees, so not all
    // five can be red.
    expect(new Set(palette).size).toBeGreaterThan(1);
  });

  it("varies lightness for monochrome palettes", () => {
    const palette = generatePalette("#6366f1", "monochrome");
    expect(new Set(palette).size).toBe(5);
  });

  it("handles gray (zero saturation) without crashing", () => {
    const palette = generatePalette("#808080", "complementary");
    expect(palette).toHaveLength(5);
    for (const color of palette) expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("rejects invalid base colors", () => {
    expect(() => generatePalette("red", "triadic")).toThrow(/hex/);
  });
});
