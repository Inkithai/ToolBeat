"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const left = a.split("\n");
  const right = b.split("\n");

  return (
    <IoWorkspace
      inputLabel="Original / changed"
      outputLabel="Diff"
      status={a || b ? "complete" : "idle"}
      input={
        <div className="grid gap-3">
          <textarea value={a} onChange={(event) => setA(event.target.value)} className="field min-h-40 font-mono" placeholder="Original text" />
          <textarea value={b} onChange={(event) => setB(event.target.value)} className="field min-h-40 font-mono" placeholder="Changed text" />
        </div>
      }
      output={
        <pre className="min-h-40 whitespace-pre-wrap border border-white/10 bg-navy-950 p-4 text-sm">
          {Array.from(new Set([...left, ...right])).map((line, index) => (
            <div
              key={`${line}-${index}`}
              className={
                left.includes(line) && right.includes(line)
                  ? "text-ink-300"
                  : right.includes(line)
                    ? "text-cyan-300"
                    : "text-rose-300"
              }
            >
              {right.includes(line) ? "+ " : "- "}
              {line}
            </div>
          ))}
        </pre>
      }
    />
  );
}
