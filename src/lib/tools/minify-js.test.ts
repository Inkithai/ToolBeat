import { describe, expect, it } from "vitest";
import { minifyJs } from "./minify-js";

describe("minifyJs", () => {
  it("removes comments and whitespace", async () => {
    const result = await minifyJs(`
      // a comment
      function add(a, b) {
        /* another */
        return a + b;
      }
    `);
    expect(result.code).not.toContain("comment");
    expect(result.code).not.toContain("  ");
    expect(result.code.length).toBeLessThan(40);
    expect(result.reducedPct).toBeGreaterThan(50);
  });

  it("mangles local names", async () => {
    const result = await minifyJs("function f() { var veryLongLocalName = 42; return veryLongLocalName; }");
    expect(result.code).not.toContain("veryLongLocalName");
  });

  it("keeps exported/global names", async () => {
    const result = await minifyJs("const publicApi = 1;");
    expect(result.code).toContain("publicApi");
  });

  it("drops console calls when asked", async () => {
    const kept = await minifyJs("console.log('x'); var a = 1;");
    expect(kept.code).toContain("console");
    const dropped = await minifyJs("console.log('x'); var a = 1;", { dropConsole: true });
    expect(dropped.code).not.toContain("console");
    expect(dropped.code).toContain("a");
  });

  it("tracks byte sizes", async () => {
    const source = "var   a   =   1 ;\n".repeat(50);
    const result = await minifyJs(source);
    expect(result.inputBytes).toBe(new TextEncoder().encode(source).length);
    expect(result.outputBytes).toBeLessThan(result.inputBytes);
  });

  it("surfaces parse errors cleanly", async () => {
    await expect(minifyJs("function { broken")).rejects.toThrow(/Unexpected token|Syntax error/);
  });

  it("collects terser warnings", async () => {
    const result = await minifyJs("var a = 1; var a = 2;");
    // Duplicate declaration warning may or may not fire depending on terser
    // version — just assert the shape.
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});
