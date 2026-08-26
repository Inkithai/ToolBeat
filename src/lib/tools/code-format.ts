import { css_beautify, html_beautify, js_beautify } from "js-beautify";

/**
 * HTML/CSS/JS formatting via js-beautify (pure JS, no network). Empty input
 * returns empty output so the shared text tools can run live without a
 * "no input yet" special case.
 */

export function formatHtml(input: string): string {
  if (!input.trim()) return "";
  // js-beautify preserves single-line input as a single line, which reads as
  // "did nothing" for pasted HTML. Split tags onto their own lines first.
  const source = input.includes("\n") ? input : input.replace(/></g, ">\n<");
  return html_beautify(source, {
    indent_size: 2,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    wrap_line_length: 0,
  });
}

export function formatCss(input: string): string {
  if (!input.trim()) return "";
  return css_beautify(input, {
    indent_size: 2,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    wrap_line_length: 0,
    selector_separator_newline: true,
  });
}

export function formatJavaScript(input: string): string {
  if (!input.trim()) return "";
  return js_beautify(input, {
    indent_size: 2,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    wrap_line_length: 0,
  });
}
