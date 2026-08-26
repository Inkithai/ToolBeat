"use client";
import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
import { useApiKey, ApiKeySettings, callOpenAI } from "@/lib/tools/ai-config";

export default function Client() {
  const { key, setKey } = useApiKey();
  const [input, setInput] = useState(""); const [output, setOutput] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [length, setLength] = useState("medium");

  const summarize = useCallback(async () => {
    if (!key) { setError("Configure your OpenAI API key first."); return; }
    if (!input.trim()) { setError("Enter text to summarize."); return; }
    setLoading(true); setError(""); setOutput("");
    try {
      const lengthHint = length === "short" ? "1-2 sentences" : length === "medium" ? "a short paragraph" : "3-4 key bullet points";
      const result = await callOpenAI(key, [
        { role: "system", content: `You are a concise summarizer. Summarize the text in ${lengthHint}. Be direct and factual.` },
        { role: "user", content: input },
      ]);
      setOutput(result);
    } catch (e) { setError(e instanceof Error ? e.message : "Summarization failed."); }
    finally { setLoading(false); }
  }, [key, input, length]);

  return (
    <div>
      <ApiKeySettings apiKey={key} onKeyChange={setKey} />
      <IoWorkspace inputLabel="Text to summarize" outputLabel="Summary" status={loading ? "processing" : output ? "complete" : error ? "error" : "idle"}
        footer={error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : undefined}
        input={<div className="space-y-3">
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={10} className="field w-full text-sm" placeholder="Paste the text you want summarized..." />
          <div className="flex gap-2 items-center">
            <span className="text-xs text-ink-400">Length:</span>
            {["short","medium","bullets"].map(l => <button key={l} type="button" onClick={() => setLength(l)} className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${length === l ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400"}`}>{l}</button>)}
          </div>
          <button type="button" onClick={summarize} disabled={loading || !key} className="btn-primary w-full"><Sparkles className="mr-2 inline h-4 w-4" />{loading ? "Summarizing..." : "Summarize"}</button>
        </div>}
        output={output ? <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4"><p className="text-sm leading-relaxed text-white whitespace-pre-wrap">{output}</p></div> : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Summary appears here</div>}
      />
    </div>
  );
}
