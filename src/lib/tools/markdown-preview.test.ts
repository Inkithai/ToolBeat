import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown-preview";

describe("renderMarkdown", () => {
  it("renders headings, emphasis and lists", () => {
    const html = renderMarkdown("# Title\n\nSome **bold** text.\n\n- one\n- two");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<li>one</li>");
  });

  it("renders links and linkifies bare URLs", () => {
    const html = renderMarkdown("[ConvertLab](https://example.com) and https://plain.example");
    expect(html).toContain('<a href="https://example.com">ConvertLab</a>');
    expect(html).toContain('href="https://plain.example"');
  });

  it("escapes raw HTML instead of passing it through", () => {
    const html = renderMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders code blocks and inline code", () => {
    const html = renderMarkdown("```\nconst a = 1;\n```\n\nInline `a < b` code.");
    expect(html).toContain("<pre><code>");
    expect(html).toContain("const a = 1;");
    expect(html).toContain("&lt;");
  });

  it("renders tables", () => {
    const html = renderMarkdown("| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });
});
