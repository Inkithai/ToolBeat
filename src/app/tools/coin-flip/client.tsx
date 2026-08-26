"use client";

import { useState, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [history, setHistory] = useState<("heads" | "tails")[]>([]);
  const [flipCount, setFlipCount] = useState(1);

  const flip = useCallback(() => {
    setFlipping(true);
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.random() < 0.5 ? "heads" : "tails");
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const final: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
        setResult(final);
        setFlipping(false);
        setHistory(prev => [...prev, final].slice(-50));
      }
    }, 100);
  }, []);

  const heads = history.filter(r => r === "heads").length;
  const tails = history.filter(r => r === "tails").length;

  return (
    <IoWorkspace
      inputLabel="Coin settings"
      outputLabel="Flip result"
      status={result ? "complete" : "idle"}
      input={
        <div className="space-y-4">
          <p className="text-sm text-ink-300">Flip a coin to get heads or tails — completely random, entirely on your device.</p>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-ink-400">Number of flips</span>
            <input
              type="number"
              min={1}
              max={100}
              value={flipCount}
              onChange={e => setFlipCount(Math.max(1, Math.min(100, +e.target.value)))}
              className="field w-full"
            />
          </label>
          <button type="button" onClick={flip} disabled={flipping} className="btn-primary w-full">
            <RotateCcw className="mr-2 inline h-4 w-4" />
            {flipping ? "Flipping..." : "Flip Coin"}
          </button>
        </div>
      }
      output={
        <div className="space-y-4">
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
            {result ? (
              <div className="text-center">
                <div className={`inline-flex h-28 w-28 items-center justify-center rounded-full border-4 ${
                  result === "heads" ? "border-yellow-500/50 bg-yellow-500/10" : "border-slate-400/50 bg-slate-400/10"
                } transition-all`}>
                  <span className="text-4xl font-extrabold text-white">
                    {result === "heads" ? "H" : "T"}
                  </span>
                </div>
                <p className="mt-3 text-lg font-bold text-white capitalize">{result}</p>
              </div>
            ) : (
              <span className="text-sm text-ink-600">Click flip to toss the coin</span>
            )}
          </div>
          {history.length > 0 && (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="mb-2 flex justify-between text-xs text-ink-400">
                <span>Heads: <strong className="text-yellow-300">{heads}</strong></span>
                <span>Tails: <strong className="text-slate-300">{tails}</strong></span>
                <span>Total: {history.length}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {history.slice(-30).map((r, i) => (
                  <span key={i} className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                    r === "heads" ? "bg-yellow-500/20 text-yellow-300" : "bg-slate-500/20 text-slate-300"
                  }`}>
                    {r === "heads" ? "H" : "T"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
