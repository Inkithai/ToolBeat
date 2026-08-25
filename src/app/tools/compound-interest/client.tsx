"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(10);
  const [compounds, setCompounds] = useState(12);
  const total = principal * (1 + rate / 100 / compounds) ** (compounds * years);

  return (
    <IoWorkspace
      status="complete"
      input={
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Principal", principal, setPrincipal],
            ["Annual rate %", rate, setRate],
            ["Years", years, setYears],
            ["Compounds/year", compounds, setCompounds],
          ].map(([label, value, setter]) => (
            <label key={label as string}>
              <span className="meta mb-2 block text-ink-500">{label as string}</span>
              <input type="number" min="0" value={value as number} onChange={(event) => (setter as (n: number) => void)(+event.target.value)} className="field" />
            </label>
          ))}
        </div>
      }
      output={
        <div>
          <p className="meta text-ink-500">Estimated total</p>
          <p className="mt-1 font-mono text-4xl font-semibold text-white">{total.toFixed(2)}</p>
        </div>
      }
    />
  );
}
