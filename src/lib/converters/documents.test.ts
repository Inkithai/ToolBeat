/**
 * @vitest-environment jsdom
 *
 * These converters depend on DOMParser, so they need a DOM. The PDF renderer
 * itself (renderHtmlToPdfBlob) is deliberately not covered here: it drives
 * html2canvas against real layout metrics that jsdom does not implement, so a
 * test would assert against a fake rather than the real pipeline.
 */
import { describe, expect, it } from "vitest";
import {
  buildPdfHtml,
  escapeHtml,
  htmlDocumentToBody,
  htmlToPlainText,
  markdownToHtml,
  markdownToPlainText,
  textToHtml,
} from "./documents";

describe("markdownToHtml", () => {
  it("renders headings, emphasis and lists", () => {
    const html = markdownToHtml("# Title\n\nSome **bold** text.\n\n- one\n- two\n");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<li>one</li>");
  });

  it("does not pass raw HTML through, which would be an injection vector", () => {
    const html = markdownToHtml("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("treats single newlines as spaces, not forced breaks", () => {
    // Regression guard: enabling markdown-it `breaks` made wrapped prose render
    // as a stack of short lines in generated PDFs.
    expect(markdownToHtml("line one\nline two")).not.toContain("<br>");
  });

  it("allows inline base64 images so embedded figures survive conversion", () => {
    const html = markdownToHtml("![alt](data:image/png;base64,iVBORw0KGgo=)");
    expect(html).toContain("src=\"data:image/png;base64,iVBORw0KGgo=\"");
  });
});

describe("escapeHtml", () => {
  it("escapes every character that can break out of markup", () => {
    expect(escapeHtml(`<a href="x">&'`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
  });

  it("escapes ampersands before other entities, avoiding double-encoding bugs", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
});

describe("textToHtml", () => {
  it("wraps plain text in a pre block with escaped content", () => {
    expect(textToHtml("<b>x</b>")).toBe('<pre class="plain-text">&lt;b&gt;x&lt;/b&gt;</pre>');
  });
});

describe("htmlDocumentToBody", () => {
  it("extracts only the body of a full document", () => {
    const body = htmlDocumentToBody("<html><head><title>T</title></head><body><p>Hi</p></body></html>");
    expect(body).toBe("<p>Hi</p>");
    expect(body).not.toContain("<title>");
  });

  it("strips script elements from untrusted input", () => {
    expect(htmlDocumentToBody("<body><p>Hi</p><script>alert(1)</script></body>")).not.toContain("script");
  });
});

describe("htmlToPlainText", () => {
  it("turns block elements into line breaks", () => {
    expect(htmlToPlainText("<p>One</p><p>Two</p>")).toBe("One\nTwo");
  });

  it("marks list items with bullets", () => {
    expect(htmlToPlainText("<ul><li>a</li><li>b</li></ul>")).toContain("• a");
  });

  it("converts <br> into newlines", () => {
    expect(htmlToPlainText("<p>a<br>b</p>")).toBe("a\nb");
  });

  it("collapses runs of blank lines", () => {
    expect(htmlToPlainText("<p>a</p><p></p><p></p><p>b</p>")).toBe("a\n\nb");
  });

  it("returns an empty string for empty input", () => {
    expect(htmlToPlainText("   ")).toBe("");
  });
});

describe("markdownToPlainText", () => {
  it("removes Markdown syntax but keeps readable structure", () => {
    const text = markdownToPlainText("# Title\n\nSome **bold** text.\n\n- one\n- two\n");
    expect(text).toContain("Title");
    expect(text).toContain("Some bold text.");
    expect(text).toContain("• one");
    expect(text).not.toContain("**");
    expect(text).not.toContain("#");
  });
});

describe("buildPdfHtml", () => {
  it("produces a complete document with an escaped title", () => {
    const html = buildPdfHtml("<p>Body</p>", "Arial, sans-serif", '<script>"x"');
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).toContain("<p>Body</p>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<title><script>");
  });

  it("applies the requested font family", () => {
    expect(buildPdfHtml("<p>x</p>", "Georgia, serif")).toContain("Georgia, serif");
  });
});
