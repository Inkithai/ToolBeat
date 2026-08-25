/**
 * Unit conversion math. Categories are independent — a length value cannot be
 * converted into a mass unit — so the public API takes an explicit category and
 * rejects cross-category pairs rather than silently inventing a result.
 *
 * Every unit is stored as a factor relative to a SI-ish base for that category
 * (metre, kilogram, litre, celsius for temperature is special-cased).
 */

export type UnitCategory = "length" | "mass" | "temperature" | "volume" | "time" | "data";

export type UnitDefinition = {
  id: string;
  label: string;
  /** Multiply by this to reach the category base unit. Unused for temperature. */
  toBase: number;
};

const LENGTH: readonly UnitDefinition[] = [
  { id: "mm", label: "Millimetres (mm)", toBase: 0.001 },
  { id: "cm", label: "Centimetres (cm)", toBase: 0.01 },
  { id: "m", label: "Metres (m)", toBase: 1 },
  { id: "km", label: "Kilometres (km)", toBase: 1000 },
  { id: "in", label: "Inches (in)", toBase: 0.0254 },
  { id: "ft", label: "Feet (ft)", toBase: 0.3048 },
  { id: "yd", label: "Yards (yd)", toBase: 0.9144 },
  { id: "mi", label: "Miles (mi)", toBase: 1609.344 },
];

const MASS: readonly UnitDefinition[] = [
  { id: "mg", label: "Milligrams (mg)", toBase: 0.000001 },
  { id: "g", label: "Grams (g)", toBase: 0.001 },
  { id: "kg", label: "Kilograms (kg)", toBase: 1 },
  { id: "oz", label: "Ounces (oz)", toBase: 0.028349523125 },
  { id: "lb", label: "Pounds (lb)", toBase: 0.45359237 },
  { id: "st", label: "Stone (st)", toBase: 6.35029318 },
];

const VOLUME: readonly UnitDefinition[] = [
  { id: "ml", label: "Millilitres (ml)", toBase: 0.001 },
  { id: "l", label: "Litres (l)", toBase: 1 },
  { id: "tsp", label: "Teaspoons (tsp)", toBase: 0.00492892159375 },
  { id: "tbsp", label: "Tablespoons (tbsp)", toBase: 0.01478676478125 },
  { id: "floz", label: "Fluid ounces US (fl oz)", toBase: 0.0295735295625 },
  { id: "cup", label: "Cups US (cup)", toBase: 0.2365882365 },
  { id: "pt", label: "Pints US (pt)", toBase: 0.473176473 },
  { id: "gal", label: "Gallons US (gal)", toBase: 3.785411784 },
];

const TIME: readonly UnitDefinition[] = [
  { id: "ms", label: "Milliseconds (ms)", toBase: 0.001 },
  { id: "s", label: "Seconds (s)", toBase: 1 },
  { id: "min", label: "Minutes (min)", toBase: 60 },
  { id: "h", label: "Hours (h)", toBase: 3600 },
  { id: "d", label: "Days (d)", toBase: 86400 },
  { id: "wk", label: "Weeks (wk)", toBase: 604800 },
];

const DATA: readonly UnitDefinition[] = [
  { id: "b", label: "Bytes (B)", toBase: 1 },
  { id: "kb", label: "Kilobytes (KB)", toBase: 1000 },
  { id: "mb", label: "Megabytes (MB)", toBase: 1_000_000 },
  { id: "gb", label: "Gigabytes (GB)", toBase: 1_000_000_000 },
  { id: "tb", label: "Terabytes (TB)", toBase: 1_000_000_000_000 },
  { id: "kib", label: "Kibibytes (KiB)", toBase: 1024 },
  { id: "mib", label: "Mebibytes (MiB)", toBase: 1024 ** 2 },
  { id: "gib", label: "Gibibytes (GiB)", toBase: 1024 ** 3 },
];

/** Temperature units use affine transforms, not a single scale factor. */
const TEMPERATURE_IDS = ["c", "f", "k"] as const;
export type TemperatureUnit = (typeof TEMPERATURE_IDS)[number];

export const UNIT_CATEGORIES: readonly {
  id: UnitCategory;
  label: string;
  units: readonly UnitDefinition[];
}[] = [
  { id: "length", label: "Length", units: LENGTH },
  { id: "mass", label: "Mass", units: MASS },
  { id: "temperature", label: "Temperature", units: [
    { id: "c", label: "Celsius (°C)", toBase: 1 },
    { id: "f", label: "Fahrenheit (°F)", toBase: 1 },
    { id: "k", label: "Kelvin (K)", toBase: 1 },
  ] },
  { id: "volume", label: "Volume", units: VOLUME },
  { id: "time", label: "Time", units: TIME },
  { id: "data", label: "Digital storage", units: DATA },
];

export function getCategory(id: UnitCategory) {
  const found = UNIT_CATEGORIES.find((category) => category.id === id);
  if (!found) throw new Error(`Unknown unit category: ${id}`);
  return found;
}

export function getUnit(category: UnitCategory, unitId: string): UnitDefinition {
  const unit = getCategory(category).units.find((entry) => entry.id === unitId);
  if (!unit) throw new Error(`Unknown unit "${unitId}" in category "${category}"`);
  return unit;
}

function celsiusFrom(value: number, from: TemperatureUnit): number {
  if (from === "c") return value;
  if (from === "f") return (value - 32) * (5 / 9);
  return value - 273.15;
}

function celsiusTo(celsius: number, to: TemperatureUnit): number {
  if (to === "c") return celsius;
  if (to === "f") return celsius * (9 / 5) + 32;
  return celsius + 273.15;
}

/**
 * Convert `value` from `fromUnit` to `toUnit` within `category`.
 * Throws if either unit is not part of the category.
 */
export function convertUnit(
  value: number,
  category: UnitCategory,
  fromUnit: string,
  toUnit: string,
): number {
  if (!Number.isFinite(value)) return value;

  if (category === "temperature") {
    if (!TEMPERATURE_IDS.includes(fromUnit as TemperatureUnit)) {
      throw new Error(`Unknown temperature unit: ${fromUnit}`);
    }
    if (!TEMPERATURE_IDS.includes(toUnit as TemperatureUnit)) {
      throw new Error(`Unknown temperature unit: ${toUnit}`);
    }
    return celsiusTo(
      celsiusFrom(value, fromUnit as TemperatureUnit),
      toUnit as TemperatureUnit,
    );
  }

  const from = getUnit(category, fromUnit);
  const to = getUnit(category, toUnit);
  const base = value * from.toBase;
  return base / to.toBase;
}

/** Round for display without inventing false precision on tiny values. */
export function formatConverted(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  if (Object.is(value, -0) || value === 0) return "0";

  const abs = Math.abs(value);
  if (abs >= 1e6 || abs < 1e-4) {
    return value.toExponential(6).replace(/\.?0+e/, "e");
  }

  // Up to 8 significant digits, strip trailing zeros.
  const fixed = Number(value.toPrecision(8));
  return String(fixed);
}
