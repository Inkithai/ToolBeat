import { describe, expect, it } from "vitest";
import { buildConicGradient, buildGradient, buildLinearGradient, buildRadialGradient, sortStops } from "./css-gradient";

const stops = [
  { color: "#ffffff", position: 0 },
  { color: "#6366f1", position: 50 },
  { color: "#0f172a", position: 100 },
];

describe("buildLinearGradient", () => {
  it("builds a linear gradient with sorted stops", () => {
    const shuffled = [...stops].reverse();
    expect(buildLinearGradient(135, shuffled)).toBe(
      "linear-gradient(135deg, #ffffff 0%, #6366f1 50%, #0f172a 100%)",
    );
  });

  it("normalizes angles", () => {
    expect(buildLinearGradient(400, stops)).toContain("linear-gradient(40deg");
    expect(buildLinearGradient(-90, stops)).toContain("linear-gradient(270deg");
  });
});

describe("buildRadialGradient", () => {
  it("builds a radial gradient", () => {
    expect(buildRadialGradient("circle", stops)).toBe(
      "radial-gradient(circle, #ffffff 0%, #6366f1 50%, #0f172a 100%)",
    );
  });
});

describe("buildConicGradient", () => {
  it("builds a conic gradient with an angle", () => {
    expect(buildConicGradient(90, stops)).toBe(
      "conic-gradient(from 90deg, #ffffff 0%, #6366f1 50%, #0f172a 100%)",
    );
  });
});

describe("buildGradient", () => {
  it("dispatches on kind", () => {
    expect(buildGradient("linear", { angle: 45, stops })).toContain("linear-gradient(45deg");
    expect(buildGradient("radial", { shape: "ellipse", stops })).toContain("radial-gradient(ellipse");
    expect(buildGradient("conic", { angle: 0, stops })).toContain("conic-gradient");
  });
});

describe("validation", () => {
  it("rejects an empty stop list", () => {
    expect(() => buildLinearGradient(0, [])).toThrow(/at least one color stop/);
  });

  it("rejects invalid colors", () => {
    expect(() => buildLinearGradient(0, [{ color: "nope", position: 0 }])).toThrow(/hex/);
  });

  it("rejects out-of-range positions", () => {
    expect(() => buildLinearGradient(0, [{ color: "#fff", position: 101 }])).toThrow(/out of range/);
  });
});

describe("sortStops", () => {
  it("sorts by position without mutating the input", () => {
    const input = [{ color: "#a", position: 99 }, { color: "#b", position: 1 }, { color: "#c", position: 50 }];
    const sorted = sortStops(input);
    expect(sorted.map((stop) => stop.position)).toEqual([1, 50, 99]);
    expect(input.map((stop) => stop.position)).toEqual([99, 1, 50]);
  });
});
