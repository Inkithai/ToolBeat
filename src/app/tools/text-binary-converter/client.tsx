"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [text, setText] = useState("Hello"); const [mode, setMode] = useState<"text-to-binary"|"binary-to-text">("text-to-binary"); const [copied, setCopied] = useState(false);
  const textToBinary = (s: string) => Array.from(s).map(c => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
  const binaryToText = (s: string) => { try { return s.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join(""); } catch { return ""; } };
  const output = mode === "text-to-binary" ? textToBinary(text) : binaryToText(text);
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <IoWorkspace inputLabel={mode === "text-to-binary" ? "Text" : "Binary (space-separated)"} outputLabel={mode === "text-to-binary" ? "Binary" : "Text"} status={output ? "complete" : "idle"}
      outputAction={output ? <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button> : undefined}
      input={<div className="space-y-3">
        <div className="flex gap-2"><button type="button" onClick={() => setMode("text-to-binary")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === "text-to-binary" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400"}`}>Text → Binary</button><button type="button" onClick={() => setMode("binary-to-text")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === "binary-to-text" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400"}`}>Binary → Text</button></div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} className="field w-full font-mono text-xs" placeholder={mode === "text-to-binary" ? "Enter text..." : "01001000 01100101 01101100 01101100 01101111"} />
      </div>}
      output={output ? <pre className="field min-h-[8rem] overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-cyan-300">{output}</pre> : <div className="flex min-h-[8rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Enter input to convert</div>}
    />
  );
}
