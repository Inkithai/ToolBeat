"use client";
import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [title, setTitle] = useState("My Amazing Page");
  const [description, setDescription] = useState("A short description of this page for social sharing.");
  const [url, setUrl] = useState("https://example.com/page");
  const [image, setImage] = useState("https://example.com/og-image.jpg");
  const [type, setType] = useState("website");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [twitterSite, setTwitterSite] = useState("@example");
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    const tags = [
      `<!-- Primary Meta Tags -->`,
      `<title>${title}</title>`,
      `<meta name="title" content="${title}" />`,
      `<meta name="description" content="${description}" />`,
      ``,
      `<!-- Open Graph / Facebook -->`,
      `<meta property="og:type" content="${type}" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:title" content="${title}" />`,
      `<meta property="og:description" content="${description}" />`,
      `<meta property="og:image" content="${image}" />`,
      ``,
      `<!-- Twitter -->`,
      `<meta property="twitter:card" content="${twitterCard}" />`,
      `<meta property="twitter:url" content="${url}" />`,
      `<meta property="twitter:title" content="${title}" />`,
      `<meta property="twitter:description" content="${description}" />`,
      `<meta property="twitter:image" content="${image}" />`,
      `<meta property="twitter:site" content="${twitterSite}" />`,
    ];
    return tags.join("\n");
  }, [title, description, url, image, type, twitterCard, twitterSite]);

  const copy = async () => { await navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <IoWorkspace inputLabel="Page details" outputLabel="Meta tags HTML" status="complete"
      outputAction={<button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button>}
      input={<div className="space-y-3">
        <label className="space-y-1"><span className="text-xs text-ink-400">Title</span><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="field w-full" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Description</span><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="field w-full" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">URL</span><input type="text" value={url} onChange={e => setUrl(e.target.value)} className="field w-full font-mono text-xs" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Image URL</span><input type="text" value={image} onChange={e => setImage(e.target.value)} className="field w-full font-mono text-xs" /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1"><span className="text-xs text-ink-400">OG Type</span><select value={type} onChange={e => setType(e.target.value)} className="field w-full"><option value="website">Website</option><option value="article">Article</option><option value="product">Product</option><option value="profile">Profile</option></select></label>
          <label className="space-y-1"><span className="text-xs text-ink-400">Twitter Card</span><select value={twitterCard} onChange={e => setTwitterCard(e.target.value)} className="field w-full"><option value="summary">Summary</option><option value="summary_large_image">Summary Large Image</option><option value="app">App</option><option value="player">Player</option></select></label>
        </div>
        <label className="space-y-1"><span className="text-xs text-ink-400">Twitter @handle</span><input type="text" value={twitterSite} onChange={e => setTwitterSite(e.target.value)} className="field w-full" /></label>
      </div>}
      output={<div className="space-y-3">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-2">Social preview</p>
          <div className="rounded-lg border border-white/10 overflow-hidden max-w-xs">
            <div className="h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-ink-500 text-xs">1200 × 630</div>
            <div className="p-3 border-t border-white/10"><p className="text-[10px] text-ink-500 uppercase">example.com</p><p className="text-sm font-bold text-white truncate">{title}</p><p className="text-xs text-ink-400 truncate">{description}</p></div>
          </div>
        </div>
        <pre className="field min-h-[10rem] overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-300">{html}</pre>
      </div>}
    />
  );
}
