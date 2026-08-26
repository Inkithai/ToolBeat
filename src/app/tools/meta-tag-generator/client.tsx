"use client";
import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [title, setTitle] = useState("My Page"); const [description, setDescription] = useState("Page description"); const [keywords, setKeywords] = useState("web, tools, developer");
  const [author, setAuthor] = useState("John Doe"); const [robots, setRobots] = useState("index, follow"); const [canonical, setCanonical] = useState("https://example.com/");
  const viewport = "width=device-width, initial-scale=1"; const [charset, setCharset] = useState("UTF-8"); const [themeColor, setThemeColor] = useState("#6366f1");
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => `<head>
  <meta charset="${charset}" />
  <meta name="viewport" content="${viewport}" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="keywords" content="${keywords}" />
  <meta name="author" content="${author}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="theme-color" content="${themeColor}" />
</head>`, [title, description, keywords, author, robots, canonical, viewport, charset, themeColor]);
  const copy = async () => { await navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <IoWorkspace inputLabel="Meta tag values" outputLabel="<head> HTML" status="complete"
      outputAction={<button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button>}
      input={<div className="space-y-2">
        <label className="space-y-1"><span className="text-xs text-ink-400">Title</span><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="field w-full" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Description</span><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="field w-full" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Keywords</span><input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} className="field w-full" /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1"><span className="text-xs text-ink-400">Author</span><input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="field w-full" /></label>
          <label className="space-y-1"><span className="text-xs text-ink-400">Robots</span><select value={robots} onChange={e => setRobots(e.target.value)} className="field w-full"><option value="index, follow">index, follow</option><option value="noindex, follow">noindex, follow</option><option value="index, nofollow">index, nofollow</option><option value="noindex, nofollow">noindex, nofollow</option></select></label>
        </div>
        <label className="space-y-1"><span className="text-xs text-ink-400">Canonical URL</span><input type="text" value={canonical} onChange={e => setCanonical(e.target.value)} className="field w-full font-mono text-xs" /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1"><span className="text-xs text-ink-400">Theme color</span><input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent" /></label>
          <label className="space-y-1"><span className="text-xs text-ink-400">Charset</span><input type="text" value={charset} onChange={e => setCharset(e.target.value)} className="field w-full" /></label>
        </div>
      </div>}
      output={<pre className="field min-h-[12rem] overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-300">{html}</pre>}
    />
  );
}
