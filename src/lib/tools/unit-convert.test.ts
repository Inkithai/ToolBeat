import { describe, expect, it } from "vitest";
import {
  convertUnit,
  formatConverted,
  getCategory,
  getUnit,
  UNIT_CATEGORIES,
} from "./unit-convert";

describe("UNIT_CATEGORIES", () => {
  it("exposes six independent categories with unique unit ids inside each", () => {
    expect(UNIT_CATEGORIES.map((c) => c.id)).toEqual([
      "length",
      "mass",
      "temperature",
      "volume",
      "time",
      "data",
    ]);
    for (const category of UNIT_CATEGORIES) {
      const ids = category.units.map((u) => u.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("convertUnit — length", () => {
  it("converts metres to kilometres and feet", () => {
    expect(convertUnit(1000, "length", "m", "km")).toBeCloseTo(1, 10);
    expect(convertUnit(1, "length", "m", "ft")).toBeCloseTo(3.280839895, 6);
  });

  it("is identity when from and to match", () => {
    expect(convertUnit(42, "length", "mi", "mi")).toBe(42);
  });

  it("round-trips through the base unit", () => {
    const miles = convertUnit(5, "length", "km", "mi");
    const back = convertUnit(miles, "length", "mi", "km");
    expect(back).toBeCloseTo(5, 10);
  });
});

describe("convertUnit — mass", () => {
  it("converts kilograms to pounds", () => {
    expect(convertUnit(1, "mass", "kg", "lb")).toBeCloseTo(2.2046226218, 6);
  });
});

describe("convertUnit — temperature", () => {
  it("handles the classic water points", () => {
    expect(convertUnit(0, "temperature", "c", "f")).toBeCloseTo(32, 10);
    expect(convertUnit(100, "temperature", "c", "f")).toBeCloseTo(212, 10);
    expect(convertUnit(0, "temperature", "c", "k")).toBeCloseTo(273.15, 10);
    expect(convertUnit(32, "temperature", "f", "c")).toBeCloseTo(0, 10);
    expect(convertUnit(273.15, "temperature", "k", "c")).toBeCloseTo(0, 10);
  });

  it("round-trips fahrenheit through celsius", () => {
    const c = convertUnit(98.6, "temperature", "f", "c");
    expect(convertUnit(c, "temperature", "c", "f")).toBeCloseTo(98.6, 8);
  });
});

describe("convertUnit — volume / time / data", () => {
  it("converts litres to millilitres", () => {
    expect(convertUnit(2.5, "volume", "l", "ml")).toBeCloseTo(2500, 8);
  });

  it("converts hours to seconds", () => {
    expect(convertUnit(1.5, "time", "h", "s")).toBe(5400);
  });

  it("distinguishes decimal MB from binary MiB", () => {
    expect(convertUnit(1, "data", "mb", "b")).toBe(1_000_000);
    expect(convertUnit(1, "data", "mib", "b")).toBe(1_048_576);
  });
});

describe("convertUnit — errors", () => {
  it("rejects unknown units", () => {
    expect(() => convertUnit(1, "length", "m", "stone")).toThrow(/Unknown unit/);
    expect(() => convertUnit(1, "temperature", "c", "rankine")).toThrow(/Unknown temperature/);
  });
});

describe("getCategory / getUnit", () => {
  it("looks up definitions", () => {
    expect(getCategory("length").label).toBe("Length");
    expect(getUnit("mass", "kg").label).toContain("Kilograms");
  });
});

describe("formatConverted", () => {
  it("formats ordinary and extreme magnitudes", () => {
    expect(formatConverted(0)).toBe("0");
    expect(formatConverted(-0)).toBe("0");
    expect(formatConverted(3.1415926535)).toBe("3.1415927");
    expect(formatConverted(1e-7)).toMatch(/e/i);
    expect(formatConverted(2_500_000)).toMatch(/e/i);
  });
});
