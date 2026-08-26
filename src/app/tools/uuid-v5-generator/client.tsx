"use client";
import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [namespace, setNamespace] = useState("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
  const [name, setName] = useState("my-unique-item"); const [uuid, setUuid] = useState(""); const [copied, setCopied] = useState(false);
  const generate = async () => {
    // UUID v5 uses SHA-1
    const nsBytes = namespace.replace(/-/g, ""); const nsArr = new Uint8Array(16);
    for (let i = 0; i < 16; i++) nsArr[i] = parseInt(nsBytes.substr(i * 2, 2), 16);
    const nameArr = new TextEncoder().encode(name);
    const combined = new Uint8Array(nsArr.length + nameArr.length);
    combined.set(nsArr); combined.set(nameArr, nsArr.length);
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-1", combined));
    const uuidBytes = hash.slice(0, 16); uuidBytes[6] = (uuidBytes[6] & 0x0f) | 0x50; uuidBytes[8] = (uuidBytes[8] & 0x3f) | 0x80;
    const hex = Array.from(uuidBytes).map(b => b.toString(16).padStart(2, "0")).join("");
    setUuid(`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`);
  };
  useEffect(() => { if (name) void generate(); }, [name, namespace, generate]);
  const copy = async () => { await navigator.clipboard.writeText(uuid); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <IoWorkspace inputLabel="Namespace & name" outputLabel="Deterministic UUID v5" status={uuid ? "complete" : "idle"}
      outputAction={uuid ? <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button> : undefined}
      input={<div className="space-y-3">
        <label className="space-y-1"><span className="text-xs text-ink-400">Namespace UUID</span><select value={namespace} onChange={e => setNamespace(e.target.value)} className="field w-full font-mono text-xs"><option value="6ba7b810-9dad-11d1-80b4-00c04fd430c8">DNS (6ba7b810-...)</option><option value="6ba7b811-9dad-11d1-80b4-00c04fd430c8">URL (6ba7b811-...)</option><option value="6ba7b812-9dad-11d1-80b4-00c04fd430c8">OID (6ba7b812-...)</option><option value="6ba7b814-9dad-11d1-80b4-00c04fd430c8">X.500 DN (6ba7b814-...)</option></select></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Name (input string)</span><input type="text" value={name} onChange={e => setName(e.target.value)} className="field w-full font-mono" /></label>
        <p className="text-[10px] text-ink-500">Same namespace + name always produces the same UUID v5.</p>
      </div>}
      output={uuid ? <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-6 text-center"><p className="text-xs text-ink-500">UUID v5</p><code className="font-mono text-2xl font-bold text-white">{uuid}</code></div> : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Enter a name to generate</div>}
    />
  );
}
