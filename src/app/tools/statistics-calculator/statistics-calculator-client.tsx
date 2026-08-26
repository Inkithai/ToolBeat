"use client";

import { useMemo, useState } from "react";
import { computeStatistics, parseNumberList } from "@/lib/tools/statistics";

const round = (value: number, digits = 4) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export default function StatisticsCalculatorClient() {
  const [text, setText] = useState("12, 15, 15, 18, 22\n25 31");

  const parsed = useMemo(() => parseNumberList(text), [text]);
  const stats = useMemo(() => {
    try {
      return { data: parsed.numbers.length > 0 ? computeStatistics(parsed.numbers) : null, error: "" };
    } catch (caught) {
      return { data: null, error: caught instanceof Error ? caught.message : "Invalid numbers." };
    }
  }, [parsed.numbers]);

  const cell = "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4";
  const label = "meta text-ink-500";
  const value = "mt-1 text-lg font-bold text-white";

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink-400">
          Numbers — separated by commas, spaces, or new lines
        </span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          className="field w-full resize-y font-mono text-sm"
          placeholder="1, 2, 3, 4, 5"
        />
      </label>

      {parsed.ignored.length > 0 && (
        <p className="text-xs text-amber-300/80">
          Ignored {parsed.ignored.length} non-numeric token{parsed.ignored.length === 1 ? "" : "s"}:{" "}
          {parsed.ignored.slice(0, 5).join(", ")}
          {parsed.ignored.length > 5 ? "…" : ""}
        </p>
      )}

      {!stats.data ? (
        <p className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-ink-500">
          Enter at least one number.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className={cell}>
              <p className={label}>Count</p>
              <p className={value}>{stats.data.count}</p>
            </div>
            <div className={cell}>
              <p className={label}>Sum</p>
              <p className={value}>{round(stats.data.sum)}</p>
            </div>
            <div className={cell}>
              <p className={label}>Mean</p>
              <p className={value}>{round(stats.data.mean)}</p>
            </div>
            <div className={cell}>
              <p className={label}>Median</p>
              <p className={value}>{round(stats.data.median)}</p>
            </div>
            <div className={cell}>
              <p className={label}>Min</p>
              <p className={value}>{round(stats.data.min)}</p>
            </div>
            <div className={cell}>
              <p className={label}>Max</p>
              <p className={value}>{round(stats.data.max)}</p>
            </div>
            <div className={cell}>
              <p className={label}>Range</p>
              <p className={value}>{round(stats.data.range)}</p>
            </div>
            <div className={cell}>
              <p className={label}>Mode</p>
              <p className={value}>{stats.data.mode ? stats.data.mode.map((m) => round(m)).join(", ") : "—"}</p>
            </div>
            <div className={cell}>
              <p className={label}>Variance (pop.)</p>
              <p className={value}>{round(stats.data.variance)}</p>
            </div>
            <div className={cell}>
              <p className={label}>Std dev (pop.)</p>
              <p className={value}>{round(stats.data.stdDev)}</p>
            </div>
            <div className={cell}>
              <p className={label}>Variance (sample)</p>
              <p className={value}>{stats.data.sampleVariance === null ? "—" : round(stats.data.sampleVariance)}</p>
            </div>
            <div className={cell}>
              <p className={label}>Std dev (sample)</p>
              <p className={value}>{stats.data.sampleStdDev === null ? "—" : round(stats.data.sampleStdDev)}</p>
            </div>
          </div>
          {stats.data.count === 1 && (
            <p className="text-xs text-ink-600">With a single value, sample variance and standard deviation are undefined.</p>
          )}
        </>
      )}
    </div>
  );
}
