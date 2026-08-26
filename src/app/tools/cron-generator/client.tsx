"use client";

import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

const FIELD_LABELS = [
  { name: "Minute", min: 0, max: 59, examples: "0-59, */5, 15,30" },
  { name: "Hour", min: 0, max: 23, examples: "0-23, */2, 9" },
  { name: "Day (month)", min: 1, max: 31, examples: "1-31, */2, 15" },
  { name: "Month", min: 1, max: 12, examples: "1-12, */3, 6" },
  { name: "Day (week)", min: 0, max: 7, examples: "0-7 (Sun=0), 1-5" },
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function explainField(field: string, label: string): string {
  if (field === "*") return `every ${label.toLowerCase()}`;
  if (field.startsWith("*/")) return `every ${field.slice(2)} ${label.toLowerCase()}(s)`;
  if (field.includes(",")) return `at ${label.toLowerCase()}s: ${field}`;
  if (field.includes("-")) return `${label.toLowerCase()}s ${field}`;
  return `at ${label.toLowerCase()} ${field}`;
}

function explainCron(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression — need 5 fields.";

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const explanations: string[] = [];

  explanations.push(explainField(minute, "Minute"));
  explanations.push(explainField(hour, "Hour"));
  explanations.push(explainField(dayOfMonth, "Day of month"));
  explanations.push(explainField(month, "Month"));
  explanations.push(explainField(dayOfWeek, "Day of week"));

  // Human-readable summary
  let summary = "";
  if (minute === "*" && hour === "*") summary = "Runs every minute";
  else if (minute.startsWith("*/") && hour === "*") summary = `Runs every ${minute.slice(2)} minutes`;
  else if (minute === "0" && hour === "*") summary = "Runs every hour";
  else if (minute === "0" && hour.startsWith("*/")) summary = `Runs every ${hour.slice(2)} hours`;
  else if (minute === "0" && hour !== "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") summary = `Runs daily at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  else if (minute === "0" && hour !== "*" && dayOfWeek !== "*" && dayOfWeek !== "0" && dayOfWeek !== "7") {
    const day = WEEKDAYS[parseInt(dayOfWeek)] || dayOfWeek;
    summary = `Runs every ${day} at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }
  else if (minute === "0" && hour === "0" && dayOfMonth === "1") summary = "Runs monthly on the 1st at midnight";
  else if (minute === "0" && hour === "0" && dayOfMonth === "*" && month === "*" && (dayOfWeek === "0" || dayOfWeek === "7")) summary = "Runs every Sunday at midnight";
  else summary = "Runs on the schedule described below";

  return `${summary}\n\n${explanations.map(e => `• ${e}`).join("\n")}`;
}

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Daily at 9 AM", value: "0 9 * * *" },
  { label: "Weekdays at 9 AM", value: "0 9 * * 1-5" },
  { label: "Weekly (Sunday midnight)", value: "0 0 * * 0" },
  { label: "Monthly (1st at midnight)", value: "0 0 1 * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Twice a day", value: "0 0,12 * * *" },
];

export default function Client() {
  const [fields, setFields] = useState(["0", "9", "*", "*", "*"]);
  const [copied, setCopied] = useState(false);

  const cron = fields.join(" ");
  const explanation = useMemo(() => explainCron(cron), [cron]);

  const copy = async () => {
    await navigator.clipboard.writeText(cron);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateField = (index: number, value: string) => {
    setFields(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const applyPreset = (preset: string) => {
    setFields(preset.split(" "));
  };

  return (
    <IoWorkspace
      inputLabel="Cron fields"
      outputLabel="Expression & explanation"
      status="complete"
      outputAction={
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      }
      input={
        <div className="space-y-3">
          {FIELD_LABELS.map((field, i) => (
            <div key={i} className="grid grid-cols-[8rem_1fr] items-center gap-2">
              <div>
                <span className="text-xs font-medium text-ink-400">{field.name}</span>
                <span className="ml-1 text-[10px] text-ink-600">({field.min}–{field.max})</span>
              </div>
              <input
                type="text"
                value={fields[i]}
                onChange={e => updateField(i, e.target.value)}
                placeholder={field.examples}
                className="field w-full font-mono text-sm"
              />
            </div>
          ))}
          <div>
            <p className="mb-2 text-xs font-medium text-ink-500">Presets</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => applyPreset(preset.value)}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[10px] font-semibold text-ink-300 transition-colors hover:border-indigo-400/30 hover:text-white"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      output={
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center">
            <code className="font-mono text-2xl font-bold text-white tracking-wider">{cron}</code>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-500">Explanation</p>
            <pre className="whitespace-pre-wrap text-sm text-ink-200">{explanation}</pre>
          </div>
        </div>
      }
    />
  );
}
