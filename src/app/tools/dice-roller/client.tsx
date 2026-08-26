"use client";

import { useState, useCallback } from "react";
import { Shuffle } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

const DIE_FACES: Record<number, string> = {
  1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅",
};

export default function Client() {
  const [diceCount, setDiceCount] = useState(2);
  const [sides, setSides] = useState(6);
  const [rolls, setRolls] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<{ values: number[]; total: number }[]>([]);

  const roll = useCallback(() => {
    setRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setRolls(Array.from({ length: diceCount }, () => Math.floor(Math.random() * sides) + 1));
      count++;
      if (count >= 8) {
        clearInterval(interval);
        const final = Array.from({ length: diceCount }, () => Math.floor(Math.random() * sides) + 1);
        setRolls(final);
        setRolling(false);
        const total = final.reduce((a, b) => a + b, 0);
        setHistory(prev => [{ values: final, total }, ...prev].slice(0, 20));
      }
    }, 80);
  }, [diceCount, sides]);

  const total = rolls.reduce((a, b) => a + b, 0);

  return (
    <IoWorkspace
      inputLabel="Dice settings"
      outputLabel="Roll result"
      status={rolls.length > 0 ? "complete" : "idle"}
      input={
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-ink-400">Number of dice</span>
              <input
                type="number"
                min={1}
                max={20}
                value={diceCount}
                onChange={e => setDiceCount(Math.max(1, Math.min(20, +e.target.value)))}
                className="field w-full"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-ink-400">Sides per die</span>
              <select value={sides} onChange={e => setSides(+e.target.value)} className="field w-full">
                {[4, 6, 8, 10, 12, 20, 100].map(n => (
                  <option key={n} value={n}>d{n}</option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={roll}
            disabled={rolling}
            className="btn-primary w-full"
          >
            <Shuffle className="mr-2 inline h-4 w-4" />
            {rolling ? "Rolling..." : `Roll ${diceCount}d${sides}`}
          </button>
        </div>
      }
      output={
        <div className="space-y-4">
          <div className="flex min-h-[8rem] flex-wrap items-center justify-center gap-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6">
            {rolls.length === 0 ? (
              <span className="text-sm text-ink-600">Click roll to cast dice</span>
            ) : sides === 6 ? (
              rolls.map((val, i) => (
                <span key={i} className="text-5xl text-white drop-shadow-lg" aria-label={`Die showing ${val}`}>
                  {DIE_FACES[val] || val}
                </span>
              ))
            ) : (
              rolls.map((val, i) => (
                <span key={i} className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/[0.05] text-2xl font-bold text-white">
                  {val}
                </span>
              ))
            )}
          </div>
          {rolls.length > 0 && (
            <p className="text-center text-sm text-ink-400">
              Total: <span className="text-2xl font-bold text-white">{total}</span>
            </p>
          )}
          {history.length > 1 && (
            <div className="max-h-32 overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="mb-1.5 text-xs font-medium text-ink-500">History</p>
              {history.slice(1).map((entry, i) => (
                <p key={i} className="text-xs text-ink-400">
                  [{entry.values.join(", ")}] = <span className="font-semibold text-white">{entry.total}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}
