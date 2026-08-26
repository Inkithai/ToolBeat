"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Plus } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [mode, setMode] = useState<"countdown" | "stopwatch">("countdown");
  // Countdown
  const [targetHours, setTargetHours] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [targetSeconds, setTargetSeconds] = useState(0);
  // Timer state
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef(0);

  // Stopwatch
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    if (mode === "countdown" && !isRunning) {
      setRemaining(targetHours * 3600 + targetMinutes * 60 + targetSeconds);
    }
  }, [mode, targetHours, targetMinutes, targetSeconds, isRunning]);

  useEffect(() => {
    if (isRunning) {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const delta = (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;

        if (mode === "countdown") {
          setRemaining(prev => {
            const next = prev - delta;
            if (next <= 0) {
              setIsRunning(false);
              setIsFinished(true);
              return 0;
            }
            return next;
          });
        } else {
          setElapsed(prev => prev + delta);
        }
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${ms}`;
  };

  const start = useCallback(() => {
    if (mode === "countdown" && remaining === 0) {
      setRemaining(targetHours * 3600 + targetMinutes * 60 + targetSeconds);
    }
    setIsFinished(false);
    setIsRunning(true);
  }, [mode, remaining, targetHours, targetMinutes, targetSeconds]);

  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setIsFinished(false);
    if (mode === "countdown") {
      setRemaining(targetHours * 3600 + targetMinutes * 60 + targetSeconds);
    } else {
      setElapsed(0);
      setLaps([]);
    }
  };

  const addLap = () => {
    if (isRunning) setLaps(prev => [elapsed, ...prev]);
  };

  const displayTime = mode === "countdown" ? remaining : elapsed;
  const totalDuration = mode === "countdown" ? (targetHours * 3600 + targetMinutes * 60 + targetSeconds) : 0;
  const progress = totalDuration > 0 ? ((totalDuration - remaining) / totalDuration) * 100 : 0;

  return (
    <IoWorkspace
      inputLabel={mode === "countdown" ? "Set countdown" : "Stopwatch"}
      outputLabel={mode === "countdown" ? "Time remaining" : "Elapsed"}
      status={isRunning ? "processing" : isFinished ? "complete" : displayTime > 0 ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setMode("countdown"); reset(); }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "countdown" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400 hover:text-white"}`}
            >
              Countdown
            </button>
            <button
              type="button"
              onClick={() => { setMode("stopwatch"); reset(); }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "stopwatch" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400 hover:text-white"}`}
            >
              Stopwatch
            </button>
          </div>
          {mode === "countdown" && !isRunning && (
            <div className="grid grid-cols-3 gap-2">
              <label className="space-y-1">
                <span className="text-[10px] text-ink-500">Hours</span>
                <input type="number" min={0} max={99} value={targetHours} onChange={e => setTargetHours(+e.target.value)} className="field w-full text-center" />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] text-ink-500">Minutes</span>
                <input type="number" min={0} max={59} value={targetMinutes} onChange={e => setTargetMinutes(+e.target.value)} className="field w-full text-center" />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] text-ink-500">Seconds</span>
                <input type="number" min={0} max={59} value={targetSeconds} onChange={e => setTargetSeconds(+e.target.value)} className="field w-full text-center" />
              </label>
            </div>
          )}
          <div className="flex gap-2">
            {!isRunning ? (
              <button type="button" onClick={start} className="btn-primary flex-1">
                <Play className="mr-2 inline h-4 w-4" /> Start
              </button>
            ) : (
              <button type="button" onClick={pause} className="btn-primary flex-1">
                <Pause className="mr-2 inline h-4 w-4" /> Pause
              </button>
            )}
            <button type="button" onClick={reset} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 text-ink-300 hover:text-white">
              <RotateCcw className="h-4 w-4" />
            </button>
            {mode === "stopwatch" && isRunning && (
              <button type="button" onClick={addLap} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 text-ink-300 hover:text-white">
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      }
      output={
        <div className="space-y-4">
          <div className={`flex min-h-[8rem] items-center justify-center rounded-xl border ${isFinished ? "border-rose-400/30 bg-rose-500/10" : "border-dashed border-white/10 bg-white/[0.02]"}`}>
            <div className="text-center">
              <p className={`font-mono text-5xl font-bold ${isFinished ? "animate-pulse text-rose-300" : "text-white"}`}>
                {formatTime(displayTime)}
              </p>
              {isFinished && <p className="mt-2 text-sm font-semibold text-rose-300">⏰ Time&apos;s up!</p>}
              {mode === "countdown" && totalDuration > 0 && !isFinished && (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          </div>
          {mode === "stopwatch" && laps.length > 0 && (
            <div className="max-h-32 overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">Laps</p>
              {laps.map((lap, i) => {
                const diff = i === 0 ? lap : lap - laps[i - 1];
                return (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-ink-500">Lap {laps.length - i}</span>
                    <span className="font-mono text-ink-300">{formatTime(diff)}</span>
                    <span className="font-mono text-ink-500">{formatTime(lap)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      }
    />
  );
}
