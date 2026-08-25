"use client";

import { useMemo, useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function DuplicateClient() {
  const [text, setText] = useState("");
  const result = useMemo(() => Array.from(new Set(text.split("\n"))).join("\n"), [text]);

  return (
    <IoWorkspace
      inputLabel="Input lines"
      outputLabel="Unique lines"
      status={text ? "complete" : "idle"}
      input={
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="field min-h-64 resize-y font-mono"
          placeholder="Paste a list…"
        />
      }
      output={
        <pre className="min-h-64 overflow-auto whitespace-pre-wrap border border-white/10 bg-navy-950 p-4 font-mono text-sm text-cyan-200">
          {result || "Cleaned output appears here"}
        </pre>
      }
    />
  );
}
