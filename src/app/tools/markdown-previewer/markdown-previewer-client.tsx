"use client";

import { useMemo, useState } from "react";
import { renderMarkdown } from "@/lib/tools/markdown-preview";

const SAMPLE = `# Markdown Previewer

Write **Markdown** on the left, see the result on the right.

- Live rendering
- Links, \u0060code\u0060, tables and more

| Tool | Status |
|------|--------|
| Previewer | Ready |

> Everything stays in your browser.
`;

export default function MarkdownPreviewerClient() {
  const [source, setSource] = useState(SAMPLE);
  const html = useMemo(() => renderMarkdown(source), [source]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink-400">Markdown</span>
        <textarea
          value={source}
          onChange={(event) => setSource(event.target.value)}
          rows={22}
          spellCheck={false}
          className="field w-full resize-y font-mono text-sm"
          placeholder="# Title"
        />
      </label>
      <div>
        <span className="mb-1.5 block text-xs font-medium text-ink-400">Preview</span>
        <div
          className="markdown-preview min-h-[24rem] w-full overflow-auto rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-ink-100"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
