"use client";
import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [urls, setUrls] = useState("https://example.com/\nhttps://example.com/about\nhttps://example.com/blog\nhttps://example.com/contact");
  const [changefreq, setChangefreq] = useState("weekly"); const [priority, setPriority] = useState("0.8"); const [copied, setCopied] = useState(false);
  const xml = useMemo(() => {
    const lines = urls.trim().split("\n").map(u => u.trim()).filter(Boolean);
    const entries = lines.map(url => `  <url>\n    <loc>${url}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`);
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;
  }, [urls, changefreq, priority]);
  const copy = async () => { await navigator.clipboard.writeText(xml); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const urlCount = urls.trim().split("\n").filter(Boolean).length;
  return (
    <IoWorkspace inputLabel="URLs (one per line)" outputLabel="sitemap.xml" status={xml ? "complete" : "idle"}
      outputAction={<button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button>}
      footer={<p className="mt-2 text-xs text-ink-500">{urlCount} URL{urlCount !== 1 ? "s" : ""} in sitemap</p>}
      input={<div className="space-y-3">
        <textarea value={urls} onChange={e => setUrls(e.target.value)} rows={8} spellCheck={false} className="field w-full font-mono text-xs" placeholder="https://example.com/page1&#10;https://example.com/page2" />
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1"><span className="text-xs text-ink-400">Change frequency</span><select value={changefreq} onChange={e => setChangefreq(e.target.value)} className="field w-full"><option value="always">Always</option><option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="never">Never</option></select></label>
          <label className="space-y-1"><span className="text-xs text-ink-400">Priority</span><select value={priority} onChange={e => setPriority(e.target.value)} className="field w-full"><option value="1.0">1.0 (Highest)</option><option value="0.8">0.8</option><option value="0.5">0.5 (Medium)</option><option value="0.3">0.3</option><option value="0.1">0.1 (Lowest)</option></select></label>
        </div>
      </div>}
      output={<pre className="field min-h-[14rem] overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-300">{xml}</pre>}
    />
  );
}
