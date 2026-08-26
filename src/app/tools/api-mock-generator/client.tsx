"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
const NAMES = ["Ada","Grace","Alan","Linus","Margaret","Tim","Hedy","Ken"];
const COMPANIES = ["ConvertLab","Acme Corp","Globex","Initech","Umbrella"];
const EMAILS = ["example.com","test.org","mock.io"];
function mockValue(key: string): unknown {
  const k = key.toLowerCase();
  if (k.includes("email")) return `${NAMES[Math.floor(Math.random()*NAMES.length)].toLowerCase()}@${EMAILS[Math.floor(Math.random()*EMAILS.length)]}`;
  if (k.includes("name")) return NAMES[Math.floor(Math.random()*NAMES.length)] + " " + NAMES[Math.floor(Math.random()*NAMES.length)];
  if (k.includes("company")) return COMPANIES[Math.floor(Math.random()*COMPANIES.length)];
  if (k.includes("id")) return Math.floor(Math.random()*10000);
  if (k.includes("price") || k.includes("amount") || k.includes("cost")) return +(Math.random()*1000).toFixed(2);
  if (k.includes("active") || k.includes("enabled") || k.includes("verified")) return Math.random() > 0.3;
  if (k.includes("date") || k.includes("created") || k.includes("updated")) return new Date(Date.now() - Math.random()*1e10).toISOString().split("T")[0];
  if (k.includes("phone")) return `+1 (${Math.floor(Math.random()*900)+100}) ${Math.floor(Math.random()*900)+100}-${Math.floor(Math.random()*9000)+1000}`;
  if (k.includes("url") || k.includes("website")) return `https://${COMPANIES[Math.floor(Math.random()*COMPANIES.length)].toLowerCase().replace(/\s/g,"")}.com`;
  if (k.includes("address")) return `${Math.floor(Math.random()*9999)+1} ${NAMES[Math.floor(Math.random()*NAMES.length)]} St`;
  if (k.includes("tag")) return ["dev","test","prod","beta"][Math.floor(Math.random()*4)];
  if (k.includes("count") || k.includes("total") || k.includes("quantity")) return Math.floor(Math.random()*100);
  if (typeof key === "string" && key.length > 0) return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g," ");
  return "value";
}
function generateMock(template: string): string {
  try { const parsed = JSON.parse(template); const mock = generateFromObj(parsed); return JSON.stringify(mock, null, 2); } catch { return "Invalid JSON template"; }
}
function generateFromObj(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.length > 0 ? Array.from({ length: 3 }, () => generateFromObj(obj[0])) : [];
  if (obj && typeof obj === "object") { const result: Record<string, unknown> = {}; for (const [key, val] of Object.entries(obj)) { result[key] = typeof val === "object" && val !== null ? generateFromObj(val) : mockValue(key); } return result; }
  return obj;
}
export default function Client() {
  const [template, setTemplate] = useState('{\n  "users": [\n    {\n      "id": 0,\n      "name": "",\n      "email": "",\n      "active": false,\n      "company": ""\n    }\n  ]\n}');
  const [copied, setCopied] = useState(false);
  const output = generateMock(template);
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <IoWorkspace inputLabel="JSON template" outputLabel="Mock data" status={output ? "complete" : "idle"}
      outputAction={output ? <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button> : undefined}
      input={<div className="space-y-3">
        <textarea value={template} onChange={e => setTemplate(e.target.value)} rows={10} spellCheck={false} className="field w-full font-mono text-xs" />
        <p className="text-[10px] text-ink-500">Field names guide generation: email, name, id, price, date, active, phone, url, etc.</p>
      </div>}
      output={<pre className="field min-h-[14rem] overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-300">{output}</pre>}
    />
  );
}
