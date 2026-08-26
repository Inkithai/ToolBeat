"use client";
import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [content, setContent] = useState("// My library code\nconsole.log('Hello');");
  const algorithm = "sha384"; const [copied, setCopied] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});

  const generate = useCallback(async () => {
    if (!content) return;
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const results: Record<string, string> = {};
    for (const algo of ["sha256", "sha384", "sha512"]) {
      const hash = await crypto.subtle.digest(algo.toUpperCase(), data);
      const b64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
      results[algo] = `${algo}-${b64}`;
    }
    setHashes(results);
  }, [content]);

  const copy = async (value: string) => { await navigator.clipboard.writeText(value); setCopied(value); setTimeout(() => setCopied(""), 2000); };

  return (
    <IoWorkspace inputLabel="Resource content or URL" outputLabel="SRI hashes" status={Object.keys(hashes).length > 0 ? "complete" : "idle"}
      input={<div className="space-y-3">
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} spellCheck={false} className="field w-full font-mono text-xs" placeholder="Paste file content here..." />
        <button type="button" onClick={generate} className="btn-primary w-full">Generate SRI Hashes</button>
        <p className="text-[10px] text-ink-500">Paste the content of the file (not a URL). Hashes computed locally with WebCrypto.</p>
      </div>}
      output={Object.keys(hashes).length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-bold text-ink-400">integrity attributes</p>
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className={`rounded-lg border px-3 py-2 ${algo === algorithm ? "border-indigo-400/20 bg-indigo-500/5" : "border-white/[0.06] bg-white/[0.02]"}`}>
              <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase text-ink-500">{algo}</span><button type="button" onClick={() => copy(hash)} className="text-ink-500 hover:text-white">{copied === hash ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}</button></div>
              <code className="mt-1 block break-all font-mono text-[10px] text-cyan-300">{hash}</code>
            </div>
          ))}
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[10px] text-ink-500">Example HTML:</p>
            <pre className="mt-1 font-mono text-[10px] text-cyan-300">{'<script src="lib.js" integrity="'}{hashes[algorithm]}{'" crossorigin="anonymous"></script>'}</pre>
          </div>
        </div>
      ) : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Paste content and click generate</div>}
    />
  );
}
