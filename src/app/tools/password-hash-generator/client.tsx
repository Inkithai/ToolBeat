"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [password, setPassword] = useState("my-secret-password"); const [algorithm, setAlgorithm] = useState("SHA-256"); const [copied, setCopied] = useState("");
  const [hash, setHash] = useState("");
  const generate = async () => {
    const data = new TextEncoder().encode(password);
    const algoMap: Record<string, string> = { "SHA-1": "SHA-1", "SHA-256": "SHA-256", "SHA-384": "SHA-384", "SHA-512": "SHA-512" };
    const hashBuffer = await crypto.subtle.digest(algoMap[algorithm], data);
    setHash(Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join(""));
  };
  useState(() => { generate(); });
  const copy = async (v: string) => { await navigator.clipboard.writeText(v); setCopied(v); setTimeout(() => setCopied(""), 2000); };
  return (
    <IoWorkspace inputLabel="Password" outputLabel="Hash" status={hash ? "complete" : "idle"}
      input={<div className="space-y-3">
        <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="field w-full font-mono" placeholder="Enter password to hash" />
        <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} className="field w-full"><option>SHA-1</option><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select>
        <button type="button" onClick={generate} className="btn-primary w-full">Generate Hash</button>
        <p className="text-[10px] text-ink-500">⚠ SHA hashes are not suitable for password storage — use bcrypt/argon2 on a server.</p>
      </div>}
      output={hash ? <div className="space-y-2"><div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"><div className="flex items-center justify-between mb-1"><span className="text-[10px] font-bold text-ink-500">{algorithm}</span><button type="button" onClick={() => copy(hash)} className="text-ink-500 hover:text-white">{copied === hash ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}</button></div><code className="break-all font-mono text-xs text-cyan-300">{hash}</code></div></div> : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Enter a password</div>}
    />
  );
}
