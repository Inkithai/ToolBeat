"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [pattern, setPattern] = useState("\\w+");
  const [sample, setSample] = useState("Test your pattern");
  let matches: string[] = [];
  let error = "";
  try {
    matches = Array.from(sample.matchAll(new RegExp(pattern, "g")), (match) => match[0]);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Invalid expression";
  }

  return (
    <IoWorkspace
      inputLabel="Pattern / sample"
      outputLabel="Matches"
      status={error ? "error" : matches.length ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <input value={pattern} onChange={(event) => setPattern(event.target.value)} className="field font-mono" placeholder="Regular expression" />
          <textarea value={sample} onChange={(event) => setSample(event.target.value)} className="field min-h-32" placeholder="Test text" />
        </div>
      }
      output={
        <p className="text-sm text-ink-200" role="status">
          {error || `${matches.length} match${matches.length === 1 ? "" : "es"}: ${matches.join(", ") || "none"}`}
        </p>
      }
    />
  );
}
