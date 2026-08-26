import { describe, expect, it } from "vitest";
import { formatCss, formatHtml, formatJavaScript } from "./code-format";

describe("formatHtml", () => {
  it("indents nested tags", () => {
    const output = formatHtml('<div><span>hi</span></div>');
    expect(output).toContain("<div>");
    expect(output).toContain("  <span>hi</span>");
    expect(output).toContain("</div>");
  });

  it("returns empty output for empty input", () => {
    expect(formatHtml("  ")).toBe("");
  });
});

describe("formatCss", () => {
  it("splits declarations onto their own lines", () => {
    const output = formatCss("a{color:red;padding:1px 2px}");
    expect(output).toContain("color: red;");
    // js-beautify v2 omits the trailing semicolon after the last declaration.
    expect(output).toContain("padding: 1px 2px");
  });

  it("returns empty output for empty input", () => {
    expect(formatCss(" ")).toBe("");
  });
});

describe("formatJavaScript", () => {
  it("indents block bodies", () => {
    const output = formatJavaScript("function f(){return 1;}");
    expect(output).toContain("function f() {");
    expect(output).toMatch(/\n\s+return 1;/);
  });

  it("returns empty output for empty input", () => {
    expect(formatJavaScript("")).toBe("");
  });
});
