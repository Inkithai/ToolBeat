"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [keyType, setKeyType] = useState("Ed25519"); const [comment, setComment] = useState("user@example.com");
  const [publicKey, setPublicKey] = useState(""); const [copied, setCopied] = useState("");
  const generate = async () => {
    const keyPair = await crypto.subtle.generateKey(
      keyType === "Ed25519" ? { name: "Ed25519" } : { name: "ECDSA", namedCurve: "P-256" } as EcKeyGenParams,
      true, ["sign", "verify"]
    ) as CryptoKeyPair;
    const pubKeyRaw = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const b64 = btoa(String.fromCharCode(...new Uint8Array(pubKeyRaw)));
    setPublicKey(`${keyType} ${b64} ${comment}`);
  };
  const copy = async (v: string) => { await navigator.clipboard.writeText(v); setCopied(v); setTimeout(() => setCopied(""), 2000); };
  return (
    <IoWorkspace inputLabel="Key settings" outputLabel="Public key" status={publicKey ? "complete" : "idle"}
      input={<div className="space-y-3">
        <label className="space-y-1"><span className="text-xs text-ink-400">Key type</span><select value={keyType} onChange={e => setKeyType(e.target.value)} className="field w-full"><option>Ed25519</option><option>ECDSA P-256</option></select></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Comment</span><input type="text" value={comment} onChange={e => setComment(e.target.value)} className="field w-full text-xs" /></label>
        <button type="button" onClick={generate} className="btn-primary w-full"><RefreshCw className="mr-2 inline h-4 w-4" />Generate Key Pair</button>
        <p className="text-[10px] text-ink-500">⚠ Keys are generated in-browser. The private key is never displayed or stored. Copy the public key and save the private key immediately.</p>
      </div>}
      output={publicKey ? <div className="space-y-3">
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-3"><p className="text-[10px] font-bold text-emerald-400 mb-1">Public key (authorized_keys format)</p><code className="break-all font-mono text-[10px] text-white">{publicKey}</code><button type="button" onClick={() => copy(publicKey)} className="mt-2 text-xs text-emerald-300 hover:text-white">{copied === publicKey ? "✓ Copied" : "Copy"}</button></div>
      </div> : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Click generate to create a key pair</div>}
    />
  );
}
