"use client";
import { useState, useMemo } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
type Rule = { agent: string; allow: string[]; disallow: string[]; crawlDelay?: number; sitemap: string };
export default function Client() {
  const [rules, setRules] = useState<Rule[]>([
    { agent: "*", allow: ["/"], disallow: ["/admin", "/api", "/private"], crawlDelay: 10, sitemap: "https://example.com/sitemap.xml" },
  ]);
  const [copied, setCopied] = useState(false);
  const output = useMemo(() => {
    const lines: string[] = [];
    for (const r of rules) {
      lines.push(`User-agent: ${r.agent}`);
      for (const a of r.allow) lines.push(`Allow: ${a}`);
      for (const d of r.disallow) lines.push(`Disallow: ${d}`);
      if (r.crawlDelay) lines.push(`Crawl-delay: ${r.crawlDelay}`);
      lines.push("");
    }
    const sitemaps = rules.map(r => r.sitemap).filter(Boolean);
    for (const s of sitemaps) lines.push(`Sitemap: ${s}`);
    return lines.join("\n");
  }, [rules]);
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const updateRule = (i: number, updates: Partial<Rule>) => setRules(rs => rs.map((r, j) => j === i ? { ...r, ...updates } : r));
  return (
    <IoWorkspace inputLabel="Rules" outputLabel="robots.txt" status="complete"
      outputAction={<button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button>}
      input={<div className="space-y-3">
        {rules.map((r, i) => (
          <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
            <div className="flex items-center justify-between"><label className="text-xs font-bold text-ink-400">User-agent</label>{rules.length > 1 && <button type="button" onClick={() => setRules(rs => rs.filter((_,j) => j !== i))} className="text-ink-600 hover:text-rose-300"><Trash2 className="h-3 w-3" /></button>}</div>
            <input type="text" value={r.agent} onChange={e => updateRule(i, { agent: e.target.value })} className="field w-full text-xs" />
            <label className="space-y-1 block"><span className="text-[10px] text-ink-500">Allow (comma-separated)</span><input type="text" value={r.allow.join(", ")} onChange={e => updateRule(i, { allow: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="field w-full text-xs" /></label>
            <label className="space-y-1 block"><span className="text-[10px] text-ink-500">Disallow (comma-separated)</span><input type="text" value={r.disallow.join(", ")} onChange={e => updateRule(i, { disallow: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="field w-full text-xs" /></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 block"><span className="text-[10px] text-ink-500">Crawl delay (s)</span><input type="number" value={r.crawlDelay || ""} onChange={e => updateRule(i, { crawlDelay: e.target.value ? +e.target.value : undefined })} className="field w-full text-xs" /></label>
              <label className="space-y-1 block"><span className="text-[10px] text-ink-500">Sitemap URL</span><input type="text" value={r.sitemap} onChange={e => updateRule(i, { sitemap: e.target.value })} className="field w-full text-xs" /></label>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setRules(rs => [...rs, { agent: "Googlebot", allow: ["/"], disallow: [], sitemap: "" }])} className="text-xs text-indigo-300 hover:text-white"><Plus className="mr-1 inline h-3 w-3" />Add rule group</button>
      </div>}
      output={<pre className="field min-h-[12rem] overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-300">{output}</pre>}
    />
  );
}
