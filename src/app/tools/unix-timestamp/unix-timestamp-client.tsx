"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { dateToUnix, describeDuration, unixToInfo } from "@/lib/tools/unix-time";

type TimestampUnit = "seconds" | "milliseconds";

export default function UnixTimestampClient() {
  const [value, setValue] = useState("1700000000");
  const [unit, setUnit] = useState<TimestampUnit>("seconds");
  const [dateInput, setDateInput] = useState("2024-01-01T12:00");
  const [copied, setCopied] = useState<"ts" | "date" | null>(null);

  const fromTimestamp = useMemo(() => {
    try {
      const trimmed = value.trim();
      if (!trimmed) return { info: null as null | ReturnType<typeof unixToInfo>, error: "" };
      return { info: unixToInfo(Number(trimmed), unit), error: "" };
    } catch (caught) {
      return { info: null, error: caught instanceof Error ? caught.message : "Invalid timestamp." };
    }
  }, [value, unit]);

  const fromDate = useMemo(() => {
    try {
      if (!dateInput) return { value: null as number | null, error: "" };
      return { value: dateToUnix(dateInput, unit), error: "" };
    } catch (caught) {
      return { value: null, error: caught instanceof Error ? caught.message : "Invalid date." };
    }
  }, [dateInput, unit]);

  const copy = async (which: "ts" | "date", text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    window.setTimeout(() => setCopied(null), 2000);
  };

  const unitToggle = (
    <div className="inline-flex overflow-hidden rounded-lg border border-white/10">
      {(["seconds", "milliseconds"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setUnit(option)}
          className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
            unit === option ? "bg-indigo-500/20 text-indigo-200" : "text-ink-400 hover:text-white"
          }`}
          aria-pressed={unit === option}
        >
          {option === "seconds" ? "Seconds" : "Milliseconds"}
        </button>
      ))}
    </div>
  );

  const copyButton = (which: "ts" | "date", text: string) => (
    <button
      type="button"
      onClick={() => void copy(which, text)}
      aria-label="Copy"
      className="shrink-0 rounded-md border border-white/10 p-1.5 text-ink-400 transition-colors hover:border-indigo-400/30 hover:text-white"
    >
      {copied === which ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h3 className="mb-3 flex flex-wrap items-center gap-3 text-sm font-bold text-white">
          Timestamp → date
          <span className="flex-1" />
          {unitToggle}
        </h3>
        <input
          type="number"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={unit === "seconds" ? "1700000000" : "1700000000000"}
          className="field w-full font-mono text-sm"
        />
        {fromTimestamp.error ? (
          <p className="mt-2 text-sm text-rose-300" role="alert">
            {fromTimestamp.error}
          </p>
        ) : (
          fromTimestamp.info && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-bold uppercase tracking-wider text-ink-500">UTC</span>
                <code className="min-w-0 flex-1 break-all font-mono text-ink-100">{fromTimestamp.info.utc}</code>
                {copyButton("ts", fromTimestamp.info.utc)}
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-bold uppercase tracking-wider text-ink-500">Local</span>
                <code className="min-w-0 flex-1 break-all font-mono text-ink-100">
                  {new Date(fromTimestamp.info.milliseconds).toString()}
                </code>
              </div>
              <p className="pt-1 text-xs text-ink-500">
                {describeDuration(Date.now() / 1000, fromTimestamp.info.seconds)}{" "}
                {fromTimestamp.info.seconds > Date.now() / 1000 ? "from now" : "ago"}
              </p>
            </div>
          )
        )}
      </section>

      <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h3 className="mb-3 text-sm font-bold text-white">Date → timestamp</h3>
        <input
          type="datetime-local"
          value={dateInput}
          onChange={(event) => setDateInput(event.target.value)}
          className="field w-full font-mono text-sm"
        />
        {fromDate.error ? (
          <p className="mt-2 text-sm text-rose-300" role="alert">
            {fromDate.error}
          </p>
        ) : (
          fromDate.value !== null && (
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-xs font-bold uppercase tracking-wider text-ink-500">
                {unit === "seconds" ? "Seconds" : "Millis"}
              </span>
              <code className="min-w-0 flex-1 break-all font-mono text-ink-100">{fromDate.value}</code>
              {copyButton("date", String(fromDate.value))}
            </div>
          )
        )}
      </section>
    </div>
  );
}
