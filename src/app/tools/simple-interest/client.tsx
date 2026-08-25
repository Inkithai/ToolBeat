"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(2);
  const interest = (principal * rate * years) / 100;

  return (
    <IoWorkspace
      status="complete"
      input={
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Principal", principal, setPrincipal],
            ["Rate %", rate, setRate],
            ["Years", years, setYears],
          ].map(([label, value, setter]) => (
            <label key={label as string}>
              <span className="meta mb-2 block text-ink-500">{label as string}</span>
              <input type="number" min="0" value={value as number} onChange={(event) => (setter as (n: number) => void)(Number(event.target.value))} className="field" />
            </label>
          ))}
        </div>
      }
      output={
        <div>
          <p className="meta text-ink-500">Total</p>
          <p className="mt-1 font-mono text-4xl font-semibold text-white">{(principal + interest).toFixed(2)}</p>
          <p className="mt-2 text-sm text-ink-400">Interest {interest.toFixed(2)}</p>
        </div>
      }
    />
  );
}
