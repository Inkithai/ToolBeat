"use client";
import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [name, setName] = useState("my-project"); const [version, setVersion] = useState("1.0.0"); const [desc, setDesc] = useState("A cool project"); const [author, setAuthor] = useState(""); const [license, setLicense] = useState("MIT");
  const [deps, setDeps] = useState("react\nreact-dom\nnext"); const [devDeps, setDevDeps] = useState("typescript\n@types/react\neslint");
  const [scripts, setScripts] = useState("dev: next dev\nbuild: next build\nstart: next start\nlint: eslint .");
  const [copied, setCopied] = useState(false);
  const output = useMemo(() => {
    const pkg: Record<string, unknown> = { name, version, description: desc, private: true };
    if (author) pkg.author = author;
    pkg.license = license;
    const parseDeps = (s: string) => { const o: Record<string,string> = {}; s.trim().split("\n").filter(Boolean).forEach(d => { const [n, v] = d.split("@").filter(Boolean); if (n) o[n] = v || "latest"; }); return o; };
    const sd = parseDeps(deps); if (Object.keys(sd).length) pkg.dependencies = sd;
    const dd = parseDeps(devDeps); if (Object.keys(dd).length) pkg.devDependencies = dd;
    const sc: Record<string,string> = {}; scripts.split("\n").filter(Boolean).forEach(l => { const [k, ...v] = l.split(":"); if (k) sc[k.trim()] = v.join(":").trim(); });
    if (Object.keys(sc).length) pkg.scripts = sc;
    return JSON.stringify(pkg, null, 2);
  }, [name, version, desc, author, license, deps, devDeps, scripts]);
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <IoWorkspace inputLabel="Package settings" outputLabel="package.json" status="complete"
      outputAction={<button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button>}
      input={<div className="space-y-2">
        <div className="grid grid-cols-3 gap-2"><label className="space-y-1"><span className="text-xs text-ink-400">Name</span><input type="text" value={name} onChange={e => setName(e.target.value)} className="field w-full" /></label><label className="space-y-1"><span className="text-xs text-ink-400">Version</span><input type="text" value={version} onChange={e => setVersion(e.target.value)} className="field w-full" /></label><label className="space-y-1"><span className="text-xs text-ink-400">License</span><select value={license} onChange={e => setLicense(e.target.value)} className="field w-full"><option>MIT</option><option>ISC</option><option>Apache-2.0</option><option>GPL-3.0</option><option>UNLICENSED</option></select></label></div>
        <label className="space-y-1"><span className="text-xs text-ink-400">Description</span><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="field w-full" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Author</span><input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="field w-full" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Dependencies (one per line: name or name@version)</span><textarea value={deps} onChange={e => setDeps(e.target.value)} rows={3} className="field w-full font-mono text-xs" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Dev dependencies</span><textarea value={devDeps} onChange={e => setDevDeps(e.target.value)} rows={3} className="field w-full font-mono text-xs" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Scripts (name: command)</span><textarea value={scripts} onChange={e => setScripts(e.target.value)} rows={4} className="field w-full font-mono text-xs" /></label>
      </div>}
      output={<pre className="field min-h-[14rem] overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-300">{output}</pre>}
    />
  );
}
