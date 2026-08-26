"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

const TIMEZONES = [
  { label: "UTC", value: "UTC" },
  { label: "US Eastern (ET)", value: "America/New_York" },
  { label: "US Central (CT)", value: "America/Chicago" },
  { label: "US Mountain (MT)", value: "America/Denver" },
  { label: "US Pacific (PT)", value: "America/Los_Angeles" },
  { label: "London (GMT/BST)", value: "Europe/London" },
  { label: "Paris (CET/CEST)", value: "Europe/Paris" },
  { label: "Berlin (CET/CEST)", value: "Europe/Berlin" },
  { label: "Moscow (MSK)", value: "Europe/Moscow" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
  { label: "Mumbai (IST)", value: "Asia/Kolkata" },
  { label: "Bangkok (ICT)", value: "Asia/Bangkok" },
  { label: "Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Beijing (CST)", value: "Asia/Shanghai" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Sydney (AEST)", value: "Australia/Sydney" },
  { label: "Auckland (NZST)", value: "Pacific/Auckland" },
];

const COMMON_TIMES = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

function formatTimeInZone(date: Date, tz: string): string {
  try {
    return date.toLocaleTimeString("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "--:--";
  }
}

function formatDateInZone(date: Date, tz: string): string {
  try {
    return date.toLocaleDateString("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" });
  } catch {
    return "---";
  }
}

function getZoneAbbr(tz: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find(p => p.type === "timeZoneName");
    return tzPart?.value || tz;
  } catch {
    return tz;
  }
}

export default function Client() {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const [date, setDate] = useState(today);
  const [time, setTime] = useState(currentTime);
  const [sourceTz, setSourceTz] = useState("America/New_York");
  const [showZones, setShowZones] = useState(["America/Los_Angeles", "America/New_York", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney"]);

  const conversions = useMemo(() => {
    if (!date || !time) return [];
    // Build a date in the source timezone
    const dateStr = `${date}T${time}:00`;
    const sourceDate = new Date(dateStr + getTimezoneOffset(sourceTz, dateStr));

    return showZones.map(tz => ({
      tz,
      label: TIMEZONES.find(t => t.value === tz)?.label || tz,
      time: formatTimeInZone(sourceDate, tz),
      date: formatDateInZone(sourceDate, tz),
      abbr: getZoneAbbr(tz),
    }));
  }, [date, time, sourceTz, showZones]);

  // Helper to approximate timezone offset
  function getTimezoneOffset(tz: string, dateStr: string): string {
    try {
      // Use Intl to find offset
      const utcDate = new Date(dateStr + "Z");
      const tzDate = new Date(utcDate.toLocaleString("en-US", { timeZone: tz }));
      const offset = (tzDate.getTime() - utcDate.getTime()) / 60000;
      const sign = offset >= 0 ? "+" : "-";
      const abs = Math.abs(offset);
      const h = Math.floor(abs / 60);
      const m = abs % 60;
      return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    } catch {
      return "+00:00";
    }
  }

  const addZone = (tz: string) => {
    if (!showZones.includes(tz)) {
      setShowZones(prev => [...prev, tz]);
    }
  };

  const removeZone = (tz: string) => {
    setShowZones(prev => prev.filter(t => t !== tz));
  };

  const availableZones = TIMEZONES.filter(tz => !showZones.includes(tz.value));

  return (
    <IoWorkspace
      inputLabel="Meeting time"
      outputLabel="World clock conversions"
      status={conversions.length > 0 ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-ink-400">Your timezone</span>
            <select value={sourceTz} onChange={e => setSourceTz(e.target.value)} className="field w-full">
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">Date</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="field w-full" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">Time</span>
              <select value={time} onChange={e => setTime(e.target.value)} className="field w-full">
                {COMMON_TIMES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-medium text-ink-500">Showing conversions to:</p>
            <div className="flex flex-wrap gap-1">
              {showZones.map(tz => (
                <button
                  key={tz}
                  type="button"
                  onClick={() => removeZone(tz)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-ink-300 hover:border-rose-400/30 hover:text-rose-300"
                >
                  {TIMEZONES.find(t => t.value === tz)?.label || tz} ×
                </button>
              ))}
            </div>
          </div>
          {availableZones.length > 0 && (
            <label className="space-y-1">
              <span className="text-xs font-medium text-ink-400">Add timezone</span>
              <select onChange={e => { if (e.target.value) { addZone(e.target.value); e.target.value = ""; } }} value="" className="field w-full">
                <option value="">Select...</option>
                {availableZones.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      }
      output={
        <div className="space-y-2">
          <div className="rounded-lg border border-indigo-400/20 bg-indigo-500/5 p-3 text-center">
            <p className="text-xs text-ink-500">Meeting starts at</p>
            <p className="text-2xl font-bold text-white">{time}</p>
            <p className="text-xs text-ink-400">{TIMEZONES.find(t => t.value === sourceTz)?.label} ({getZoneAbbr(sourceTz)})</p>
          </div>
          {conversions.map(conv => (
            <div key={conv.tz} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <div>
                <p className="text-xs font-semibold text-ink-200">{conv.label}</p>
                <p className="text-[10px] text-ink-500">{conv.date}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-white">{conv.time}</p>
                <p className="text-[10px] text-ink-500">{conv.abbr}</p>
              </div>
            </div>
          ))}
          {conversions.length === 0 && (
            <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
              Set the meeting time to see conversions
            </div>
          )}
        </div>
      }
    />
  );
}
