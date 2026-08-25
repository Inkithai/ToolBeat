"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [bill, setBill] = useState(100);
  const [tip, setTip] = useState(15);
  const [people, setPeople] = useState(1);
  const tipAmount = (bill * tip) / 100;
  const total = bill + tipAmount;

  return (
    <IoWorkspace
      status="complete"
      input={
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Bill", bill, setBill],
            ["Tip %", tip, setTip],
            ["People", people, setPeople],
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
          <p className="meta text-cyan-400">Each person pays</p>
          <p className="mt-1 font-mono text-4xl font-semibold text-white">{(total / Math.max(1, people)).toFixed(2)}</p>
          <p className="mt-2 text-sm text-ink-400">
            Tip {tipAmount.toFixed(2)} · Total {total.toFixed(2)}
          </p>
        </div>
      }
    />
  );
}
