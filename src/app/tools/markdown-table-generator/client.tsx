"use client";
import { useState, useMemo } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

type TableData = { headers: string[]; rows: string[][] };

export default function Client() {
  const [data, setData] = useState<TableData>({
    headers: ["Column 1", "Column 2", "Column 3"],
    rows: [["Cell 1", "Cell 2", "Cell 3"], ["Cell 4", "Cell 5", "Cell 6"]],
  });
  const [alignment, setAlignment] = useState<("left"|"center"|"right")[]>(["left","left","left"]);
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => {
    const headerRow = `| ${data.headers.join(" | ")} |`;
    const separator = `| ${alignment.map(a => a === "center" ? ":---:" : a === "right" ? "---:" : ":---").join(" | ")} |`;
    const bodyRows = data.rows.map(row => `| ${row.join(" | ")} |`);
    return [headerRow, separator, ...bodyRows].join("\n");
  }, [data, alignment]);

  const copy = async () => { await navigator.clipboard.writeText(markdown); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const updateHeader = (i: number, val: string) => setData(d => ({ ...d, headers: d.headers.map((h, j) => j === i ? val : h) }));
  const updateCell = (r: number, c: number, val: string) => setData(d => ({ ...d, rows: d.rows.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? val : cell) : row) }));
  const addRow = () => setData(d => ({ ...d, rows: [...d.rows, d.headers.map(() => "")] }));
  const addCol = () => setData(d => ({ headers: [...d.headers, `Column ${d.headers.length + 1}`], rows: d.rows.map(r => [...r, ""]) }));
  const removeRow = (i: number) => setData(d => ({ ...d, rows: d.rows.filter((_, ri) => ri !== i) }));

  return (
    <IoWorkspace inputLabel="Table editor" outputLabel="Markdown" status={markdown ? "complete" : "idle"}
      outputAction={<button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button>}
      input={<div className="space-y-3">
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>{data.headers.map((h, i) => (
                <th key={i} className="px-1 pb-1">
                  <input type="text" value={h} onChange={e => updateHeader(i, e.target.value)} className="field w-full py-1 text-center font-bold" />
                  <select value={alignment[i]} onChange={e => setAlignment(a => a.map((v, j) => j === i ? e.target.value as "left"|"center"|"right" : v))} className="field mt-1 w-full py-0.5 text-center">
                    <option value="left">← Left</option><option value="center">↔ Center</option><option value="right">Right →</option>
                  </select>
                </th>
              ))}</tr>
            </thead>
            <tbody>
              {data.rows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => (
                  <td key={ci} className="px-1 py-0.5"><input type="text" value={cell} onChange={e => updateCell(ri, ci, e.target.value)} className="field w-full py-1" /></td>
                ))}<td className="px-1"><button type="button" onClick={() => removeRow(ri)} className="text-ink-600 hover:text-rose-300"><Trash2 className="h-3 w-3" /></button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={addRow} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-ink-300 hover:text-white"><Plus className="mr-1 inline h-3 w-3" />Row</button>
          <button type="button" onClick={addCol} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-ink-300 hover:text-white"><Plus className="mr-1 inline h-3 w-3" />Column</button>
        </div>
      </div>}
      output={<pre className="field min-h-[10rem] overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-300">{markdown}</pre>}
    />
  );
}
