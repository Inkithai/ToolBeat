"use client";

import { useState } from "react";
import yaml from "js-yaml";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [input, setInput] = useState("");
  let output = "";
  let error = "";
  try {
    output = input.trim() ? JSON.stringify(yaml.load(input), null, 2) : "";
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Invalid YAML";
  }

  return (
    <IoWorkspace
      status={error ? "error" : output ? "complete" : "idle"}
      input={
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="field min-h-56 font-mono"
          placeholder="Paste YAML…"
        />
      }
      output={
        error ? (
          <p role="alert" className="text-sm text-rose-300">{error}</p>
        ) : (
          <pre className="min-h-56 whitespace-pre-wrap border border-white/10 bg-navy-950 p-4 font-mono text-sm text-cyan-200">
            {output || "JSON appears here."}
          </pre>
        )
      }
    />
  );
}
