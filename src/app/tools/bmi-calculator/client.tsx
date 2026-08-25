"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const bmi = weight / (height / 100) ** 2;
  const label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy range" : bmi < 30 ? "Overweight" : "Obesity";

  return (
    <IoWorkspace
      status="complete"
      input={
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="meta mb-2 block text-ink-500">Weight (kg)</span>
            <input type="number" value={weight} onChange={(event) => setWeight(+event.target.value)} className="field" />
          </label>
          <label>
            <span className="meta mb-2 block text-ink-500">Height (cm)</span>
            <input type="number" value={height} onChange={(event) => setHeight(+event.target.value)} className="field" />
          </label>
        </div>
      }
      output={
        <div>
          <p className="font-mono text-5xl font-semibold text-white">{bmi.toFixed(1)}</p>
          <p className="mt-2 text-cyan-300">{label}</p>
        </div>
      }
    />
  );
}
