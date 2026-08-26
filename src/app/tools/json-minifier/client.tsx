"use client";
import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [input, setInput] = useState('{\n  "name": "Ada",\n  "age": 30,\n  "tags": ["engineer", "mathematician"]\n}');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      const output = JSON.stringify(JSON.parse(input));
      return { output, error: "" };
    } catch {
      return { output: "", error: "Invalid JSON" };
    }
  }, [input]);

  const saved = input.length - result.output.length;
  const copy = async () => { await navigator.clipboard.writeText(result.output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <IoWorkspace inputLabel="JSON (formatted)" outputLabel="Minified JSON" status={result.output ? "complete" : "error"}
      outputAction={result.output ? <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button> : undefined}
      footer={result.error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{result.error}</p> : result.output ? <p className="mt-3 text-xs text-ink-500">Original: {input.length} chars → Minified: {result.output.length} chars (saved {saved} bytes, {input.length > 0 ? Math.round(saved/input.length*100) : 0}%)</p> : undefined}
      input={<textarea value={input} onChange={e => setInput(e.target.value)} rows={12} spellCheck={false} className="field w-full font-mono text-xs" />}
      output={result.output ? <pre className="field min-h-[10rem] overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-cyan-300">{result.output}</pre> : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Enter JSON to minify</div>}
    />
  );
}
