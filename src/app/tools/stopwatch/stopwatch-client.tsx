"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, Pause, Play, RotateCcw } from "lucide-react";
import { formatClock, formatLapDelta } from "@/lib/tools/time-format";

type Lap = {
  index: number;
  total: number;
  delta: number;
};

export default function StopwatchClient() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startedAtRef = useRef(0);
  const frozenRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    startedAtRef.current = performance.now() - frozenRef.current;
    let frame = 0;
    const tick = () => {
      frozenRef.current = performance.now() - startedAtRef.current;
      setElapsed(frozenRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const toggle = useCallback(() => {
    setRunning((current) => !current);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    frozenRef.current = 0;
  }, []);

  const lap = useCallback(() => {
    setLaps((current) => {
      const total = frozenRef.current;
      const previous = current[0]?.total ?? 0;
      return [{ index: current.length + 1, total, delta: total - previous }, ...current];
    });
  }, []);

  return (
    <div className="mx-auto max-w-xl">
      <p
        className={`text-center font-mono text-6xl font-bold tabular-nums tracking-tight text-white sm:text-7xl ${
          running ? "" : "text-ink-200"
        }`}
        aria-label="Elapsed time"
      >
        {formatClock(elapsed)}
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        {!running && elapsed > 0 && (
          <button type="button" onClick={lap} className="btn-secondary px-5 py-3 text-sm" aria-label="Record lap">
            <Flag className="h-4 w-4" />
            Lap
          </button>
        )}
        <button
          type="button"
          onClick={toggle}
          className={`inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-colors ${
            running
              ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30 hover:bg-amber-500/25"
              : "bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-400/30 hover:bg-indigo-500/25"
          }`}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
        </button>
        {elapsed > 0 && (
          <button type="button" onClick={reset} className="btn-secondary px-5 py-3 text-sm" aria-label="Reset stopwatch">
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>

      {laps.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-ink-500">
                <th className="px-4 py-2.5 font-semibold">Lap</th>
                <th className="px-4 py-2.5 font-semibold">Split</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {laps.map((row) => (
                <tr key={row.index} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-4 py-2 font-semibold text-ink-200">#{row.index}</td>
                  <td className="px-4 py-2 font-mono text-ink-300">{formatLapDelta(row.delta)}</td>
                  <td className="px-4 py-2 text-right font-mono text-ink-200">{formatClock(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
