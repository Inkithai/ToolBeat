"use client";
import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
function mdToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/^---$/gm, "<hr />")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hbluio])/gm, (m, offset, str) => {
      const before = str.slice(0, offset);
      if (before.endsWith("\n") || offset === 0) return "";
      return m;
    });
}
export default function Client() {
  const [md, setMd] = useState("# Hello World\n\nThis is **bold** and *italic*.\n\n## List\n- Item one\n- Item two\n\n[Link](https://example.com)\n\n```\ncode block\n```");
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => mdToHtml(md), [md]);
  const copy = async () => { await navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <IoWorkspace inputLabel="Markdown" outputLabel="HTML output" status={html ? "complete" : "idle"}
      outputAction={html ? <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button> : undefined}
      input={<textarea value={md} onChange={e => setMd(e.target.value)} rows={12} spellCheck={false} className="field w-full font-mono text-xs" />}
      output={<pre className="field min-h-[12rem] overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-300">{html}</pre>}
    />
  );
}
