"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

type DiffEntry = { path: string; type: "added" | "removed" | "changed"; left?: unknown; right?: unknown };

function diffObjects(left: unknown, right: unknown, path = ""): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  if (left === right) return diffs;
  if (left === null || right === null || typeof left !== typeof right || typeof left !== "object") {
    diffs.push({ path: path || "(root)", type: "changed", left, right });
    return diffs;
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) {
      diffs.push({ path, type: "changed", left, right });
      return diffs;
    }
    const maxLen = Math.max(left.length, right.length);
    for (let i = 0; i < maxLen; i++) {
      const p = `${path}[${i}]`;
      if (i >= left.length) diffs.push({ path: p, type: "added", right: right[i] });
      else if (i >= right.length) diffs.push({ path: p, type: "removed", left: left[i] });
      else diffs.push(...diffObjects(left[i], right[i], p));
    }
    return diffs;
  }
  const allKeys = new Set([...Object.keys(left as object), ...Object.keys(right as object)]);
  for (const key of allKeys) {
    const p = path ? `${path}.${key}` : key;
    if (!(key in (left as object))) diffs.push({ path: p, type: "added", right: (right as Record<string, unknown>)[key] });
    else if (!(key in (right as object))) diffs.push({ path: p, type: "removed", left: (left as Record<string, unknown>)[key] });
    else diffs.push(...diffObjects((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key], p));
  }
  return diffs;
}

export default function Client() {
  const [left, setLeft] = useState('{"name":"Ada","age":30}');
  const [right, setRight] = useState('{"name":"Ada","age":31,"email":"ada@example.com"}');
  const [leftError, setLeftError] = useState("");
  const [rightError, setRightError] = useState("");

  const diffs = useMemo(() => {
    try {
      setLeftError("");
      const l = JSON.parse(left);
      try {
        setRightError("");
        const r = JSON.parse(right);
        return diffObjects(l, r);
      } catch {
        setRightError("Invalid JSON");
        return [];
      }
    } catch {
      setLeftError("Invalid JSON");
      return [];
    }
  }, [left, right]);

  const added = diffs.filter(d => d.type === "added").length;
  const removed = diffs.filter(d => d.type === "removed").length;
  const changed = diffs.filter(d => d.type === "changed").length;

  return (
    <IoWorkspace
      inputLabel="JSON A (left)"
      outputLabel="Differences"
      status={diffs.length > 0 ? "complete" : leftError || rightError ? "error" : "idle"}
      footer={
        (leftError || rightError) ? (
          <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
            {leftError} {rightError}
          </p>
        ) : undefined
      }
      input={
        <div className="space-y-3">
          <textarea
            value={left}
            onChange={e => setLeft(e.target.value)}
            rows={10}
            spellCheck={false}
            className="field w-full font-mono text-xs"
            placeholder='{"key": "value"}'
          />
          <p className="text-xs font-medium text-ink-500">JSON B (right)</p>
          <textarea
            value={right}
            onChange={e => setRight(e.target.value)}
            rows={10}
            spellCheck={false}
            className="field w-full font-mono text-xs"
            placeholder='{"key": "different"}'
          />
        </div>
      }
      output={
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-2">
              <p className="text-2xl font-bold text-emerald-300">{added}</p>
              <p className="text-[10px] text-ink-500">Added</p>
            </div>
            <div className="rounded-lg border border-rose-400/20 bg-rose-500/5 p-2">
              <p className="text-2xl font-bold text-rose-300">{removed}</p>
              <p className="text-[10px] text-ink-500">Removed</p>
            </div>
            <div className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-2">
              <p className="text-2xl font-bold text-amber-300">{changed}</p>
              <p className="text-[10px] text-ink-500">Changed</p>
            </div>
          </div>
          {diffs.length === 0 && !leftError && !rightError && (
            <div className="flex min-h-[8rem] items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/5 text-sm text-emerald-300">
              ✓ Both JSON objects are identical
            </div>
          )}
          {diffs.length > 0 && (
            <div className="max-h-[16rem] overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.02]">
              {diffs.map((d, i) => (
                <div key={i} className="border-b border-white/[0.04] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      d.type === "added" ? "bg-emerald-500/20 text-emerald-300" :
                      d.type === "removed" ? "bg-rose-500/20 text-rose-300" :
                      "bg-amber-500/20 text-amber-300"
                    }`}>
                      {d.type === "added" ? "+" : d.type === "removed" ? "−" : "~"}
                    </span>
                    <code className="flex-1 font-mono text-xs text-ink-200">{d.path}</code>
                  </div>
                  {d.type === "changed" && (
                    <div className="mt-1 grid grid-cols-2 gap-2 text-[10px]">
                      <code className="truncate text-rose-300">{JSON.stringify(d.left)}</code>
                      <code className="truncate text-emerald-300">{JSON.stringify(d.right)}</code>
                    </div>
                  )}
                  {d.type === "added" && <code className="mt-1 block text-[10px] text-emerald-300">{JSON.stringify(d.right)}</code>}
                  {d.type === "removed" && <code className="mt-1 block text-[10px] text-rose-300">{JSON.stringify(d.left)}</code>}
                </div>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}
