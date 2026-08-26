"use client";
import { useState, useCallback } from "react";
import { Sparkles, Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
import { useApiKey, ApiKeySettings, callOpenAI } from "@/lib/tools/ai-config";

export default function Client() {
  const { key, setKey } = useApiKey();
  const [schema, setSchema] = useState("users(id, name, email, created_at)\nposts(id, user_id, title, body, published, created_at)\ncomments(id, post_id, user_id, body, created_at)");
  const [question, setQuestion] = useState(""); const [sql, setSql] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    if (!key) { setError("Configure your OpenAI API key first."); return; }
    setLoading(true); setError(""); setSql("");
    try {
      const result = await callOpenAI(key, [
        { role: "system", content: "You are a SQL expert. Given a schema and a natural language question, return ONLY the SQL query. No explanations, no markdown, just the raw SQL." },
        { role: "user", content: `Schema:\n${schema}\n\nQuestion: ${question}` },
      ]);
      setSql(result.trim().replace(/```sql\n?/g, "").replace(/```\n?/g, "").trim());
    } catch (e) { setError(e instanceof Error ? e.message : "Generation failed."); }
    finally { setLoading(false); }
  }, [key, schema, question]);

  const copy = async () => { await navigator.clipboard.writeText(sql); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div>
      <ApiKeySettings apiKey={key} onKeyChange={setKey} />
      <IoWorkspace inputLabel="Schema & question" outputLabel="SQL query" status={sql ? "complete" : loading ? "processing" : error ? "error" : "idle"}
        outputAction={sql ? <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button> : undefined}
        footer={error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : undefined}
        input={<div className="space-y-3">
          <label className="space-y-1"><span className="text-xs font-bold text-ink-400">Schema</span><textarea value={schema} onChange={e => setSchema(e.target.value)} rows={4} className="field w-full font-mono text-xs" placeholder="table(col1, col2, ...)" /></label>
          <label className="space-y-1"><span className="text-xs font-bold text-ink-400">Question</span><input type="text" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()} className="field w-full" placeholder="e.g. Find users who posted more than 5 times" /></label>
          <button type="button" onClick={generate} disabled={loading || !key} className="btn-primary w-full"><Sparkles className="mr-2 inline h-4 w-4" />{loading ? "Generating..." : "Generate SQL"}</button>
        </div>}
        output={sql ? <pre className="field min-h-[10rem] overflow-auto whitespace-pre-wrap font-mono text-sm text-cyan-300">{sql}</pre> : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">SQL query appears here</div>}
      />
    </div>
  );
}
