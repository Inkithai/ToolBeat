import { describe, expect, it } from "vitest";
import { validateYaml } from "./validate-yaml";

describe("validateYaml", () => {
  it("accepts simple mappings", () => {
    const result = validateYaml("name: ConvertLab\ntools: 100\nactive: true");
    expect(result.valid).toBe(true);
    expect(result.documentCount).toBe(1);
  });

  it("accepts lists and nested structures", () => {
    const result = validateYaml("items:\n  - a\n  - b\nnested:\n  deep: [1, 2, 3]");
    expect(result.valid).toBe(true);
  });

  it("accepts a plain top-level list", () => {
    expect(validateYaml("- a\n- b").valid).toBe(true);
  });

  it("reports bad indentation with position", () => {
    const result = validateYaml("a:\n  b: 1\n   c: 2");
    expect(result.valid).toBe(false);
    expect(result.issues[0]?.message).toBeTruthy();
    expect(result.issues[0]?.line).toBe(3);
  });

  it("reports tabs in indentation", () => {
    const result = validateYaml("a:\n\tb: 1");
    expect(result.valid).toBe(false);
  });

  it("validates multi-document streams", () => {
    const result = validateYaml("a: 1\n---\nb: 2\n---\nc: 3");
    expect(result.valid).toBe(true);
    expect(result.documentCount).toBe(3);
  });

  it("detects errors in later documents of a stream", () => {
    const result = validateYaml("a: 1\n---\n  bad: [unclosed");
    expect(result.valid).toBe(false);
  });

  it("rejects empty input", () => {
    expect(validateYaml("").valid).toBe(false);
  });

  it("treats blank-only input as nothing to validate", () => {
    expect(validateYaml("   \n  ").valid).toBe(false);
  });
});
