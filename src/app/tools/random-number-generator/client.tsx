"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [result, setResult] = useState<number | null>(null);

  function generate() {
    const low = Math.ceil(Math.min(min, max));
    const high = Math.floor(Math.max(min, max));
    setResult(low + Math.floor(Math.random() * (high - low + 1)));
  }

  return (
    <IoWorkspace
      status={result === null ? "idle" : "complete"}
      input={
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="meta mb-2 block text-ink-500">Minimum</span>
            <input type="number" value={min} onChange={(event) => setMin(Number(event.target.value))} className="field" />
          </label>
          <label>
            <span className="meta mb-2 block text-ink-500">Maximum</span>
            <input type="number" value={max} onChange={(event) => setMax(Number(event.target.value))} className="field" />
          </label>
        </div>
      }
      output={<p className="font-mono text-5xl font-semibold text-white">{result ?? "—"}</p>}
      process={
        <button type="button" onClick={generate} className="btn-primary">
          Generate number
        </button>
      }
    />
  );
}
