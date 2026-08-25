"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [price, setPrice] = useState(100);
  const [discount, setDiscount] = useState(20);
  const savings = (price * discount) / 100;

  return (
    <IoWorkspace
      status="complete"
      input={
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="meta mb-2 block text-ink-500">Original price</span>
            <input type="number" min="0" value={price} onChange={(event) => setPrice(Number(event.target.value))} className="field" />
          </label>
          <label>
            <span className="meta mb-2 block text-ink-500">Discount percent</span>
            <input type="number" min="0" max="100" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="field" />
          </label>
        </div>
      }
      output={
        <div className="space-y-3">
          <div>
            <p className="meta text-ink-500">You save</p>
            <p className="font-mono text-2xl font-semibold text-white">{savings.toFixed(2)}</p>
          </div>
          <div>
            <p className="meta text-cyan-400">Final price</p>
            <p className="font-mono text-3xl font-semibold text-white">{Math.max(0, price - savings).toFixed(2)}</p>
          </div>
        </div>
      }
    />
  );
}
