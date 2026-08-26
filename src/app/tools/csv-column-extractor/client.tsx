"use client";
import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [csv, setCsv] = useState("name,email,age,city\nAda,ada@example.com,36,London\nGrace,grace@example.com,85,New York\nAlan,alan@example.com,41,Princeton");
  const [columns, setColumns] = useState("0,2");
  const [delimiter, setDelimiter] = useState(",");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      const lines = csv.trim().split("\n").map(l => l.split(delimiter));
      const colIndices = columns.split(/[,;]/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (colIndices.length === 0) return { rows: [], output: "", colCount: 0 };
      const selectedHeaders = colIndices.map(i => lines[0]?.[i] ?? `col${i}`).join(delimiter);
      const rows = lines.slice(1).map(row => colIndices.map(i => row[i] ?? "").join(delimiter));
      const output = [selectedHeaders, ...rows].join("\n");
      return { headers: lines[0] ?? [], rows, output, colCount: colIndices.length };
    } catch { return { headers: [], rows: [], output: "", colCount: 0 }; }
  }, [csv, columns, delimiter]);

  const copy = async () => { await navigator.clipboard.writeText(result.output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <IoWorkspace inputLabel="CSV input" outputLabel="Extracted columns" status={result.output ? "complete" : "idle"}
      outputAction={result.output ? <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button> : undefined}
      input={
        <div className="space-y-3">
          <textarea value={csv} onChange={e => setCsv(e.target.value)} rows={6} spellCheck={false} className="field w-full font-mono text-xs" />
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1"><span className="text-xs text-ink-400">Column indices (0-based)</span><input type="text" value={columns} onChange={e => setColumns(e.target.value)} placeholder="0,2,3" className="field w-full text-xs" /></label>
            <label className="space-y-1"><span className="text-xs text-ink-400">Delimiter</span><select value={delimiter} onChange={e => setDelimiter(e.target.value)} className="field w-full text-xs"><option value=",">Comma (,)</option><option value=";">Semicolon (;)</option><option value="\t">Tab</option><option value="|">Pipe (|)</option></select></label>
          </div>
          {result.output && <p className="text-[10px] text-ink-500">Extracted {result.colCount} column{result.colCount !== 1 ? "s" : ""}</p>}
        </div>
      }
      output={result.output ? <pre className="field min-h-[10rem] overflow-auto whitespace-pre font-mono text-xs text-cyan-300">{result.output}</pre> : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Paste CSV and select columns</div>}
    />
  );
}
