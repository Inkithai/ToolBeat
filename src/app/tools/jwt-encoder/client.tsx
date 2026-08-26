"use client";

import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default function Client() {
  const [header, setHeader] = useState('{"alg":"HS256","typ":"JWT"}');
  const [payload, setPayload] = useState('{"sub":"1234567890","name":"Ada Lovelace","iat":1516239022}');
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const jwt = useMemo(() => {
    try {
      setError("");
      const headerObj = JSON.parse(header);
      const payloadObj = JSON.parse(payload);
      const encodedHeader = base64UrlEncode(JSON.stringify(headerObj));
      const encodedPayload = base64UrlEncode(JSON.stringify(payloadObj));

      // Note: Real JWT signing requires HMAC-SHA256 which needs SubtleCrypto (async)
      // For display purposes, show the unsigned token structure
      return { encodedHeader, encodedPayload, header: headerObj, payload: payloadObj };
    } catch {
      setError("Invalid JSON in header or payload");
      return null;
    }
  }, [header, payload]);

  const copy = async () => {
    if (!jwt) return;
    const token = `${jwt.encodedHeader}.${jwt.encodedPayload}.SIGNATURE`;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <IoWorkspace
      inputLabel="JWT parts"
      outputLabel="Encoded token"
      status={jwt ? "complete" : "error"}
      outputAction={
        jwt ? (
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        ) : undefined
      }
      footer={error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">{error}</p> : undefined}
      input={
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-bold text-rose-300">Header (JSON)</p>
            <textarea value={header} onChange={e => setHeader(e.target.value)} rows={3} spellCheck={false} className="field w-full font-mono text-xs" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold text-indigo-300">Payload (JSON)</p>
            <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={5} spellCheck={false} className="field w-full font-mono text-xs" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold text-emerald-300">Secret</p>
            <input type="text" value={secret} onChange={e => setSecret(e.target.value)} className="field w-full font-mono text-xs" />
          </div>
          <p className="text-[10px] text-ink-600">
            ⚠ Signature requires server-side HMAC-SHA256. This tool encodes the header and payload; the signature placeholder is shown.
          </p>
        </div>
      }
      output={
        jwt ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-500">Encoded JWT</p>
              <code className="block break-all font-mono text-xs leading-relaxed">
                <span className="text-rose-300">{jwt.encodedHeader}</span>
                <span className="text-ink-500">.</span>
                <span className="text-indigo-300">{jwt.encodedPayload}</span>
                <span className="text-ink-500">.</span>
                <span className="text-emerald-300">signature</span>
              </code>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-rose-400/10 bg-rose-500/5 p-2">
                <p className="text-[10px] font-bold text-rose-400">Header decoded</p>
                <pre className="mt-1 font-mono text-[10px] text-rose-200">{JSON.stringify(jwt.header, null, 2)}</pre>
              </div>
              <div className="rounded-lg border border-indigo-400/10 bg-indigo-500/5 p-2">
                <p className="text-[10px] font-bold text-indigo-400">Payload decoded</p>
                <pre className="mt-1 font-mono text-[10px] text-indigo-200">{JSON.stringify(jwt.payload, null, 2)}</pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            Enter valid JSON header and payload
          </div>
        )
      }
    />
  );
}
