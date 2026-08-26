/**
 * Markdown → HTML for the previewer, via markdown-it (already a dependency).
 * Raw HTML in the source is escaped — the preview is for reading, not
 * executing, whatever gets pasted in.
 */

import MarkdownIt from "markdown-it";

const renderer = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
  typographer: false,
});

export function renderMarkdown(source: string): string {
  return renderer.render(source);
}
