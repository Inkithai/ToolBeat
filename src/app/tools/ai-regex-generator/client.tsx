"use client";
import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
import { useApiKey, ApiKeySettings, callOpenAI } from "@/lib/tools/ai-config";

export default function Client() {
  const { key, setKey } = useApiKey();
  const [description, setDescription] = useState(""); const [regex, setRegex] = useState(""); const [explanation, setExplanation] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const [testInput, setTestInput] = useState("");

  const generate = useCallback(async () => {
    if (!key) { setError("Configure your OpenAI API key first."); return; }
    setLoading(true); setError(""); setRegex(""); setExplanation("");
    try {
      const result = await callOpenAI(key, [
        { role: "system", content: "You are a regex expert. Given a description, return ONLY a JSON object with two fields: 'pattern' (the regex without delimiters) and 'explanation' (a brief breakdown of what each part does). No markdown, no code blocks, just raw JSON." },
        { role: "user", content: description },
      ]);
      const parsed = JSON.parse(result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
      setRegex(parsed.pattern); setExplanation(parsed.explanation);
    } catch (e) { setError(e instanceof Error ? e.message : "Generation failed."); }
    finally { setLoading(false); }
  }, [key, description]);

  const matches = (() => { try { if (!regex || !testInput) return []; return [...testInput.matchAll(new RegExp(regex, "g"))].map(m => m[0]); } catch { return []; } })();

  return (
    <div>
      <ApiKeySettings apiKey={key} onKeyChange={setKey} />
      <IoWorkspace inputLabel="Describe the pattern" outputLabel="Regex & test" status={regex ? "complete" : loading ? "processing" : error ? "error" : "idle"}
        footer={error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : undefined}
        input={<div className="space-y-3">
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="field w-full text-sm" placeholder="e.g. Match valid email addresses&#10;e.g. Match US phone numbers&#10;e.g. Match hex color codes" />
          <button type="button" onClick={generate} disabled={loading || !key} className="btn-primary w-full"><Sparkles className="mr-2 inline h-4 w-4" />{loading ? "Generating..." : "Generate Regex"}</button>
        </div>}
        output={<div className="space-y-3">
          {regex && <>
            <div className="rounded-lg border border-indigo-400/20 bg-indigo-500/5 p-3"><code className="block break-all font-mono text-lg text-white">/{regex}/g</code></div>
            {explanation && <p className="text-xs text-ink-300">{explanation}</p>}
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <label className="text-xs font-bold text-ink-400">Test against text</label>
              <input type="text" value={testInput} onChange={e => setTestInput(e.target.value)} className="field mt-1 w-full font-mono text-xs" placeholder="Type test text..." />
              {matches.length > 0 && <p className="mt-2 text-xs text-emerald-300">{matches.length} match{matches.length !== 1 ? "es" : ""}: {matches.map((m, i) => <code key={i} className="mx-1 rounded bg-emerald-500/10 px-1">{m}</code>)}</p>}
            </div>
          </>}
          {!regex && <div className="flex min-h-[8rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Describe what to match</div>}
        </div>}
      />
    </div>
  );
}
