"use client";
import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
import { useApiKey, ApiKeySettings, callOpenAI } from "@/lib/tools/ai-config";

const TONES = [
  { id: "professional", label: "Professional", hint: "formal, clear, business-appropriate" },
  { id: "casual", label: "Casual", hint: "friendly, relaxed, conversational" },
  { id: "concise", label: "Concise", hint: "short, direct, no filler" },
  { id: "persuasive", label: "Persuasive", hint: "compelling, benefit-focused" },
  { id: "simpler", label: "Simpler", hint: "plain language, easy to understand" },
];

export default function Client() {
  const { key, setKey } = useApiKey();
  const [input, setInput] = useState(""); const [output, setOutput] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [tone, setTone] = useState("professional");

  const rewrite = useCallback(async () => {
    if (!key) { setError("Configure your OpenAI API key first."); return; }
    setLoading(true); setError(""); setOutput("");
    try {
      const toneConfig = TONES.find(t => t.id === tone);
      const result = await callOpenAI(key, [
        { role: "system", content: `Rewrite the text to be ${toneConfig?.hint}. Keep the same meaning and length. Do not add explanations.` },
        { role: "user", content: input },
      ]);
      setOutput(result);
    } catch (e) { setError(e instanceof Error ? e.message : "Rewrite failed."); }
    finally { setLoading(false); }
  }, [key, input, tone]);

  return (
    <div>
      <ApiKeySettings apiKey={key} onKeyChange={setKey} />
      <IoWorkspace inputLabel="Original text" outputLabel="Rewritten" status={loading ? "processing" : output ? "complete" : error ? "error" : "idle"}
        footer={error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : undefined}
        input={<div className="space-y-3">
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={8} className="field w-full text-sm" placeholder="Enter text to rewrite..." />
          <div className="flex flex-wrap gap-1.5">{TONES.map(t => <button key={t.id} type="button" onClick={() => setTone(t.id)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone === t.id ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400"}`}>{t.label}</button>)}</div>
          <button type="button" onClick={rewrite} disabled={loading || !key} className="btn-primary w-full"><Sparkles className="mr-2 inline h-4 w-4" />{loading ? "Rewriting..." : "Rewrite"}</button>
        </div>}
        output={output ? <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4"><p className="text-sm leading-relaxed text-white whitespace-pre-wrap">{output}</p></div> : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Rewritten text appears here</div>}
      />
    </div>
  );
}
