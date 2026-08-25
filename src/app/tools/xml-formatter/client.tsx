"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [input, setInput] = useState("");
  const output = input
    .replace(/>\s*</g, ">\n<")
    .split("\n")
    .reduce(
      (acc, line) => {
        const next = line.match(/^<\//) ? -1 : line.match(/^<[^!][^>]*[^/]>/) ? 1 : 0;
        const depth = Math.max(0, (acc.depth || 0) + next);
        acc.depth = depth;
        acc.lines.push("  ".repeat(Math.max(0, depth - (next < 0 ? 0 : 1))) + line.trim());
        return acc;
      },
      { depth: 0, lines: [] as string[] },
    )
    .lines.join("\n");

  return (
    <IoWorkspace
      status={output ? "complete" : "idle"}
      input={
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="field min-h-56 font-mono"
          placeholder="Paste XML…"
        />
      }
      output={
        <pre className="min-h-56 whitespace-pre-wrap border border-white/10 bg-navy-950 p-4 font-mono text-sm text-cyan-200">
          {output || "Formatted XML appears here."}
        </pre>
      }
    />
  );
}
