"use client";
import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [pem, setPem] = useState(""); const [info, setInfo] = useState<Record<string, string> | null>(null); const [error, setError] = useState("");
  const decode = () => {
    try {
      setError(""); setInfo(null);
      const b64 = pem.replace(/-----BEGIN CERTIFICATE-----/, "").replace(/-----END CERTIFICATE-----/, "").replace(/\s/g, "");
      if (!b64) throw new Error("No certificate data");
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      // Basic ASN.1 info extraction (simplified)
      setInfo({
        "Size": `${bytes.length} bytes`,
        "Format": "X.509 Certificate (PEM → DER)",
        "SHA-256 Fingerprint": "See hash below",
        "Note": "Full X.509 parsing requires ASN.1 decoder. This shows basic info.",
      });
      crypto.subtle.digest("SHA-256", bytes).then(h => {
        const fp = Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join(":").toUpperCase();
        setInfo(prev => prev ? { ...prev, "SHA-256 Fingerprint": fp } : null);
      });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to decode"); }
  };
  return (
    <IoWorkspace inputLabel="PEM certificate" outputLabel="Certificate info" status={info ? "complete" : error ? "error" : "idle"}
      footer={error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : undefined}
      input={<div className="space-y-3"><textarea value={pem} onChange={e => setPem(e.target.value)} rows={8} spellCheck={false} className="field w-full font-mono text-[10px]" placeholder="-----BEGIN CERTIFICATE-----&#10;MIIBkTCB+wIJALRiMLAh...&#10;-----END CERTIFICATE-----" /><button type="button" onClick={decode} className="btn-primary w-full">Decode</button></div>}
      output={info ? <div className="space-y-1.5">{Object.entries(info).map(([k, v]) => <div key={k} className="flex items-start justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"><span className="text-xs text-ink-500">{k}</span><code className="font-mono text-xs font-bold text-white break-all text-right">{v}</code></div>)}</div> : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Paste a PEM certificate and decode</div>}
    />
  );
}
