"use client";
import { useState, useEffect, useRef } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

type KeyEvent = { key: string; code: string; keyCode: number; which: number; location: number; ctrlKey: boolean; altKey: boolean; shiftKey: boolean; metaKey: boolean; repeat: boolean };

export default function Client() {
  const [events, setEvents] = useState<KeyEvent[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      setEvents(prev => [{
        key: e.key, code: e.code, keyCode: e.keyCode, which: e.which,
        location: e.location, ctrlKey: e.ctrlKey, altKey: e.altKey,
        shiftKey: e.shiftKey, metaKey: e.metaKey, repeat: e.repeat,
      }, ...prev].slice(0, 5));
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, []);

  const last = events[0];
  const rows = last ? [
    { label: "Key", value: JSON.stringify(last.key) },
    { label: "Code", value: last.code },
    { label: "keyCode", value: String(last.keyCode) },
    { label: "which", value: String(last.which) },
    { label: "Location", value: ["Standard","Left","Right","Numpad"][last.location] || "Unknown" },
    { label: "Modifiers", value: [last.ctrlKey && "Ctrl", last.altKey && "Alt", last.shiftKey && "Shift", last.metaKey && "Meta"].filter(Boolean).join(" + ") || "None" },
  ] : [];

  return (
    <div ref={containerRef} tabIndex={0} className="outline-none">
      <IoWorkspace
        inputLabel="Press any key"
        outputLabel="Event properties"
        status={last ? "complete" : "idle"}
        input={
          <div className="flex min-h-[12rem] items-center justify-center rounded-xl border-2 border-dashed border-indigo-400/30 bg-indigo-500/5">
            {last ? (
              <div className="text-center">
                <code className="font-mono text-5xl font-extrabold text-white">{last.key === " " ? "Space" : last.key}</code>
                <p className="mt-2 text-sm text-ink-400">Press another key…</p>
              </div>
            ) : (
              <p className="text-sm text-ink-500">Click here and press any key</p>
            )}
          </div>
        }
        output={
          last ? (
            <div className="space-y-2">
              {rows.map(r => (
                <div key={r.label} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-ink-500">{r.label}</span>
                  <code className="font-mono text-sm font-bold text-white">{r.value}</code>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
              Press a key to see its event properties
            </div>
          )
        }
      />
    </div>
  );
}
