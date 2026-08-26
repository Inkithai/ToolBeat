import { describe, expect, it } from "vitest";
import { minifyHtml } from "./minify-html";

describe("minifyHtml", () => {
  it("removes comments and normalizes tag whitespace", () => {
    expect(minifyHtml(`<div   class="a"  id="b" >x</div><!-- gone --><p>y</p>`)).toBe(
      '<div class="a" id="b">x</div><p>y</p>',
    );
  });

  it("drops whitespace between block-level elements", () => {
    const input = `<html>\n  <head>\n    <title>t</title>\n    <meta charset="utf-8">\n  </head>\n  <body>\n    <div>\n      <p>hi</p>\n    </div>\n  </body>\n</html>`;
    expect(minifyHtml(input)).toBe('<html><head><title>t</title><meta charset="utf-8"></head><body><div><p>hi</p></div></body></html>');
  });

  it("keeps a single space between inline elements", () => {
    expect(minifyHtml("<p>a <b>b</b> c</p>")).toBe("<p>a <b>b</b> c</p>");
    expect(minifyHtml("<span>x</span>\n  <span>y</span>")).toBe("<span>x</span> <span>y</span>");
  });

  it("keeps whitespace inside attribute values", () => {
    expect(minifyHtml('<a title="a  b">x</a>')).toBe('<a title="a  b">x</a>');
  });

  it("collapses runs of whitespace in text to one space", () => {
    expect(minifyHtml("<p>a\n   b\r\nc</p>")).toBe("<p>a b c</p>");
  });

  it("leaves script and style content untouched", () => {
    const input = '<script>\n  if (a < b) {\n    // comment\n  }\n</script>';
    expect(minifyHtml(input)).toBe(input);
    const probe = '<p>a</p><script>\n  if (a < b) {\n    // comment\n  }\n</script>';
    expect(minifyHtml(probe)).toBe("<p>a</p>" + input);
    const style = '<style>\n  .a {\n    color: red;\n  }\n</style>';
    expect(minifyHtml(style)).toBe(style);
  });

  it("leaves textarea and pre content untouched", () => {
    expect(minifyHtml('<textarea>\n  line one\n  line two</textarea>')).toBe(
      '<textarea>\n  line one\n  line two</textarea>',
    );
    expect(minifyHtml("<pre>a\n  b</pre>")).toBe("<pre>a\n  b</pre>");
  });

  it("keeps doctypes and self-closing tags", () => {
    expect(minifyHtml("<!DOCTYPE html><img src='x' />")).toBe("<!DOCTYPE html><img src='x'/>");
  });

  it("handles unbalanced inline text at document edges", () => {
    expect(minifyHtml("  <b>x</b>  ")).toBe("<b>x</b>");
  });
});
