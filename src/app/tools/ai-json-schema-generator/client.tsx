"use client";
import { useState, useCallback } from "react";
import { Sparkles, Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
import { useApiKey, ApiKeySettings, callOpenAI } from "@/lib/tools/ai-config";

export default function Client() {
  const { key, setKey } = useApiKey();
  const [description, setDescription] = useState(""); const [schema, setSchema] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    if (!key) { setError("Configure your OpenAI API key first."); return; }
    setLoading(true); setError(""); setSchema("");
    try {
      const result = await callOpenAI(key, [
        { role: "system", content: "Generate a JSON Schema (draft-07) from the description. Return ONLY the JSON Schema object. No markdown, no explanations." },
        { role: "user", content: description },
      ]);
      const cleaned = result.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
      JSON.parse(cleaned); // validate
      setSchema(JSON.stringify(JSON.parse(cleaned), null, 2));
    } catch (e) { setError(e instanceof Error ? e.message : "Generation failed."); }
    finally { setLoading(false); }
  }, [key, description]);

  const copy = async () => { await navigator.clipboard.writeText(schema); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div>
      <ApiKeySettings apiKey={key} onKeyChange={setKey} />
      <IoWorkspace inputLabel="Describe the data" outputLabel="JSON Schema" status={schema ? "complete" : loading ? "processing" : error ? "error" : "idle"}
        outputAction={schema ? <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button> : undefined}
        footer={error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : undefined}
        input={<div className="space-y-3">
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} className="field w-full text-sm" placeholder="e.g. A user profile with name, email, age, address (with street, city, zip), and a list of interests" />
          <button type="button" onClick={generate} disabled={loading || !key} className="btn-primary w-full"><Sparkles className="mr-2 inline h-4 w-4" />{loading ? "Generating..." : "Generate Schema"}</button>
        </div>}
        output={schema ? <pre className="field min-h-[14rem] overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-300">{schema}</pre> : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Describe your data structure</div>}
      />
    </div>
  );
}
