"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { usePersistentState } from "@/lib/storage/preferences";

type Phase = "focus" | "shortBreak" | "longBreak";

type PomodoroPreferences = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Completed focus sessions before a long break. */
  sessionsBeforeLongBreak: number;
};

const DEFAULTS: PomodoroPreferences = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

const PHASE_LABELS: Record<Phase, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PomodoroClient() {
  const [preferences, updatePreferences] = usePersistentState<PomodoroPreferences>(
    "pomodoro",
    DEFAULTS
  );
  const [phase, setPhase] = useState<Phase>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [remaining, setRemaining] = useState(DEFAULTS.focusMinutes * 60);

  const durationFor = useCallback(
    (target: Phase): number => {
      const minutes =
        target === "focus"
          ? preferences.focusMinutes
          : target === "shortBreak"
            ? preferences.shortBreakMinutes
            : preferences.longBreakMinutes;
      return minutes * 60;
    },
    [preferences]
  );

  // The deadline is absolute rather than a decremented counter. Accumulating
  // interval callbacks drift badly — and browsers throttle timers in background
  // tabs — so elapsed time is always derived from the clock instead.
  const deadlineRef = useRef<number | null>(null);

  const startPhase = useCallback(
    (target: Phase, autoStart: boolean) => {
      const duration = durationFor(target);
      setPhase(target);
      setRemaining(duration);
      setIsRunning(autoStart);
      deadlineRef.current = autoStart ? Date.now() + duration * 1000 : null;
    },
    [durationFor]
  );

  const advance = useCallback(() => {
    if (phase === "focus") {
      const next = completedSessions + 1;
      setCompletedSessions(next);
      startPhase(next % preferences.sessionsBeforeLongBreak === 0 ? "longBreak" : "shortBreak", false);
    } else {
      startPhase("focus", false);
    }
  }, [completedSessions, phase, preferences.sessionsBeforeLongBreak, startPhase]);

  useEffect(() => {
    if (!isRunning) return;

    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + remaining * 1000;
    }

    const id = window.setInterval(() => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;
      const secondsLeft = Math.round((deadline - Date.now()) / 1000);

      if (secondsLeft <= 0) {
        setRemaining(0);
        setIsRunning(false);
        deadlineRef.current = null;
        advance();
      } else {
        setRemaining(secondsLeft);
      }
    }, 250);

    return () => window.clearInterval(id);
    // `remaining` is read only to seed the deadline on resume; including it
    // would rebuild the interval every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, advance]);

  // Keep a paused clock in sync when its duration preference changes.
  useEffect(() => {
    if (!isRunning) setRemaining(durationFor(phase));
  }, [durationFor, isRunning, phase]);

  const toggle = useCallback(() => {
    setIsRunning((running) => {
      if (running) {
        deadlineRef.current = null;
        return false;
      }
      deadlineRef.current = Date.now() + remaining * 1000;
      return true;
    });
  }, [remaining]);

  const reset = useCallback(() => {
    deadlineRef.current = null;
    setIsRunning(false);
    setRemaining(durationFor(phase));
  }, [durationFor, phase]);

  const total = durationFor(phase);
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/5 bg-white/[0.025] p-8 text-center">
        <div className="mb-2 flex justify-center gap-2">
          {(Object.keys(PHASE_LABELS) as Phase[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => startPhase(item, false)}
              aria-pressed={phase === item}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                phase === item
                  ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
                  : "border-white/10 bg-white/[0.03] text-ink-200 hover:bg-white/[0.07]"
              }`}
            >
              {PHASE_LABELS[item]}
            </button>
          ))}
        </div>

        {/* role="timer" with a polite live region announces the phase change
            without reading out every single second. */}
        <div
          role="timer"
          aria-live="polite"
          aria-label={`${PHASE_LABELS[phase]}, ${formatClock(remaining)} remaining`}
          className="my-4 font-mono text-6xl font-extrabold tabular-nums text-white sm:text-7xl"
        >
          {formatClock(remaining)}
        </div>

        <div className="mx-auto mb-6 h-1.5 max-w-sm overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cyan-500 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-bold text-white transition-colors hover:bg-cyan-400"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-ink-50 transition-colors hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            type="button"
            onClick={advance}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-ink-50 transition-colors hover:bg-white/10"
          >
            <SkipForward className="h-4 w-4" /> Skip
          </button>
        </div>

        <p className="mt-5 text-sm text-ink-200">
          {completedSessions} focus session{completedSessions === 1 ? "" : "s"} completed
        </p>
      </section>

      <section className="rounded-2xl border border-white/5 bg-white/[0.025] p-5">
        <h2 className="mb-4 text-sm font-bold text-white">Intervals</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["focusMinutes", "Focus", 1, 120],
              ["shortBreakMinutes", "Short break", 1, 60],
              ["longBreakMinutes", "Long break", 1, 60],
              ["sessionsBeforeLongBreak", "Sessions per long break", 1, 12],
            ] as const
          ).map(([key, label, min, max]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-200">{label}</span>
              <input
                type="number"
                min={min}
                max={max}
                value={preferences[key]}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  if (!Number.isFinite(parsed)) return;
                  updatePreferences({ [key]: Math.min(max, Math.max(min, Math.round(parsed))) });
                }}
                className="w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
              />
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-200">
          Interval lengths are saved in this browser. Nothing about your sessions is uploaded.
        </p>
      </section>
    </div>
  );
}
