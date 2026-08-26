"use client";
import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

function inferSchema(value: unknown): object {
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) {
    if (value.length === 0) return { type: "array", items: {} };
    return { type: "array", items: inferSchema(value[0]) };
  }
  if (typeof value === "object") {
    const properties: Record<string, object> = {};
    const required: string[] = [];
    for (const [key, val] of Object.entries(value as object)) {
      properties[key] = inferSchema(val);
      required.push(key);
    }
    return { type: "object", properties, required };
  }
  if (typeof value === "string") return { type: "string" };
  if (typeof value === "number") return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
  if (typeof value === "boolean") return { type: "boolean" };
  return {};
}

export default function Client() {
  const [json, setJson] = useState('{\n  "id": 1,\n  "name": "Ada Lovelace",\n  "email": "ada@example.com",\n  "active": true,\n  "tags": ["engineer", "mathematician"],\n  "address": {\n    "city": "London",\n    "zip": "SW1A 1AA"\n  }\n}');
  const [copied, setCopied] = useState(false); const [error, setError] = useState("");

  const schema = useMemo(() => {
    try { setError(""); const parsed = JSON.parse(json); const s = inferSchema(parsed); return JSON.stringify({ $schema: "http://json-schema.org/draft-07/schema#", ...s }, null, 2); }
    catch { setError("Invalid JSON"); return ""; }
  }, [json]);

  const copy = async () => { await navigator.clipboard.writeText(schema); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <IoWorkspace inputLabel="JSON sample" outputLabel="JSON Schema (draft-07)" status={schema ? "complete" : "error"}
      outputAction={schema ? <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button> : undefined}
      footer={error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : undefined}
      input={<textarea value={json} onChange={e => setJson(e.target.value)} rows={14} spellCheck={false} className="field w-full font-mono text-xs" />}
      output={schema ? <pre className="field min-h-[14rem] overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-300">{schema}</pre> : <div className="flex min-h-[14rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Enter JSON to generate schema</div>}
    />
  );
}
