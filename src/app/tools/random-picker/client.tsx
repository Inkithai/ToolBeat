"use client";

import { useState, useCallback } from "react";
import { Shuffle, Plus, Trash2 } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [items, setItems] = useState<string[]>(["Pizza", "Sushi", "Burger", "Tacos", "Pasta"]);
  const [input, setInput] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [removeAfterPick, setRemoveAfterPick] = useState(false);
  const [uniqueMode, setUniqueMode] = useState(false);

  const pick = useCallback(() => {
    if (items.length === 0) return;
    setPicking(true);
    let count = 0;
    const interval = setInterval(() => {
      setPicked(items[Math.floor(Math.random() * items.length)]);
      count++;
      if (count >= 12) {
        clearInterval(interval);
        const final = items[Math.floor(Math.random() * items.length)];
        setPicked(final);
        setPicking(false);
        setHistory(prev => [final, ...prev].slice(0, 20));
        if (removeAfterPick) {
          setItems(prev => prev.filter(item => item !== final));
        }
      }
    }, 80);
  }, [items, removeAfterPick]);

  const addItem = () => {
    const trimmed = input.trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems(prev => [...prev, trimmed]);
      setInput("");
    } else if (trimmed) {
      setItems(prev => [...prev, trimmed]);
      setInput("");
    }
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <IoWorkspace
      inputLabel="Options"
      outputLabel="Picked"
      status={picked ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addItem()}
              placeholder="Add an option..."
              className="field flex-1"
            />
            <button type="button" onClick={addItem} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 text-ink-200 hover:text-white">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-40 overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.02]">
            {items.length === 0 ? (
              <p className="p-3 text-xs text-ink-600">No options yet. Add some above.</p>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between px-3 py-1.5">
                    <span className="text-sm text-ink-200">{item}</span>
                    <button type="button" onClick={() => removeItem(i)} className="text-ink-600 hover:text-rose-300">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs text-ink-300">
              <input type="checkbox" checked={removeAfterPick} onChange={e => setRemoveAfterPick(e.target.checked)} className="rounded accent-indigo-500" />
              Remove after pick
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-300">
              <input type="checkbox" checked={uniqueMode} onChange={e => setUniqueMode(e.target.checked)} className="rounded accent-indigo-500" />
              No repeats
            </label>
          </div>
          <button type="button" onClick={pick} disabled={items.length === 0 || picking} className="btn-primary w-full">
            <Shuffle className="mr-2 inline h-4 w-4" />
            {picking ? "Picking..." : `Pick from ${items.length} options`}
          </button>
        </div>
      }
      output={
        <div className="space-y-4">
          <div className="flex min-h-[8rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
            {picked ? (
              <div className="text-center">
                <p className="text-3xl font-extrabold text-white">{picked}</p>
                <p className="mt-1 text-xs text-ink-500">was randomly selected</p>
              </div>
            ) : (
              <span className="text-sm text-ink-600">Click pick to choose randomly</span>
            )}
          </div>
          {history.length > 1 && (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="mb-1.5 text-xs font-medium text-ink-500">History</p>
              {history.slice(1).map((item, i) => (
                <p key={i} className="text-xs text-ink-400">
                  <span className="font-semibold text-ink-200">{item}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}
