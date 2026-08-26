"use client";
import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [services, setServices] = useState([
    { name: "web", image: "nginx:latest", port: "80:80", volumes: "./html:/usr/share/nginx/html:ro", env: "" },
    { name: "db", image: "postgres:16", port: "5432:5432", volumes: "pgdata:/var/lib/postgresql/data", env: "POSTGRES_PASSWORD=secret\nPOSTGRES_DB=myapp" },
  ]);
  const [copied, setCopied] = useState(false);
  const yaml = useMemo(() => {
    const lines = ["version: '3.8'", "services:"];
    for (const s of services) {
      lines.push(`  ${s.name}:`);
      lines.push(`    image: ${s.image}`);
      if (s.port) { lines.push(`    ports:`); lines.push(`      - "${s.port}"`); }
      if (s.volumes) { lines.push(`    volumes:`); for (const v of s.volumes.split("\n").filter(Boolean)) lines.push(`      - ${v}`); }
      if (s.env) { lines.push(`    environment:`); for (const e of s.env.split("\n").filter(Boolean)) lines.push(`      - ${e}`); }
      lines.push(`    restart: unless-stopped`);
    }
    const volNames = services.flatMap(s => s.volumes.split("\n").filter(Boolean).map(v => v.split(":")[0]).filter(v => !v.startsWith(".") && !v.startsWith("/")));
    if (volNames.length > 0) { lines.push(""); lines.push("volumes:"); volNames.forEach(v => lines.push(`  ${v}:`)); }
    return lines.join("\n");
  }, [services]);
  const copy = async () => { await navigator.clipboard.writeText(yaml); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const updateSvc = (i: number, field: string, val: string) => setServices(svcs => svcs.map((s, j) => j === i ? { ...s, [field]: val } : s));
  return (
    <IoWorkspace inputLabel="Services" outputLabel="docker-compose.yml" status="complete"
      outputAction={<button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button>}
      input={<div className="space-y-3">{services.map((s, i) => <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2"><label className="space-y-1"><span className="text-[10px] text-ink-500">Service name</span><input type="text" value={s.name} onChange={e => updateSvc(i, "name", e.target.value)} className="field w-full text-xs" /></label><label className="space-y-1"><span className="text-[10px] text-ink-500">Image</span><input type="text" value={s.image} onChange={e => updateSvc(i, "image", e.target.value)} className="field w-full text-xs" /></label></div>
        <label className="space-y-1"><span className="text-[10px] text-ink-500">Port mapping</span><input type="text" value={s.port} onChange={e => updateSvc(i, "port", e.target.value)} className="field w-full text-xs" /></label>
        <label className="space-y-1"><span className="text-[10px] text-ink-500">Volumes (one per line)</span><textarea value={s.volumes} onChange={e => updateSvc(i, "volumes", e.target.value)} rows={2} className="field w-full font-mono text-[10px]" /></label>
        <label className="space-y-1"><span className="text-[10px] text-ink-500">Environment vars</span><textarea value={s.env} onChange={e => updateSvc(i, "env", e.target.value)} rows={2} className="field w-full font-mono text-[10px]" /></label>
      </div>)}<button type="button" onClick={() => setServices(svcs => [...svcs, { name: "service", image: "alpine:latest", port: "", volumes: "", env: "" }])} className="text-xs text-indigo-300 hover:text-white">+ Add service</button></div>}
      output={<pre className="field min-h-[16rem] overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-300">{yaml}</pre>}
    />
  );
}
