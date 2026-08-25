"use client";

import { useCallback, useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

const sets = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,./?",
};

export default function PasswordClient() {
  const [length, setLength] = useState(20);
  const [options, setOptions] = useState({ lower: true, upper: true, numbers: true, symbols: true });
  const [password, setPassword] = useState("");

  const generate = useCallback(() => {
    const pool = Object.entries(options)
      .filter(([, on]) => on)
      .map(([key]) => sets[key as keyof typeof sets])
      .join("");
    if (!pool) return setPassword("");
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    setPassword(Array.from(values, (value) => pool[value % pool.length]).join(""));
  }, [length, options]);

  return (
    <IoWorkspace
      inputLabel="Options"
      outputLabel="Password"
      status={password ? "complete" : "idle"}
      input={
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 flex justify-between text-sm font-semibold text-ink-200">
              Length <output>{length}</output>
            </span>
            <input type="range" min="8" max="64" value={length} onChange={(event) => setLength(Number(event.target.value))} className="w-full accent-indigo-500" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.keys(options).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm text-ink-200">
                <input
                  type="checkbox"
                  checked={options[key as keyof typeof options]}
                  onChange={() => setOptions((current) => ({ ...current, [key]: !current[key as keyof typeof options] }))}
                  className="h-4 w-4 accent-indigo-500"
                />
                Include {key}
              </label>
            ))}
          </div>
        </div>
      }
      output={
        <div>
          <p className="break-all font-mono text-lg text-cyan-200">{password || "Click generate to create a password"}</p>
          {password && (
            <button type="button" onClick={() => navigator.clipboard?.writeText(password)} className="btn-secondary mt-3 text-xs">
              Copy password
            </button>
          )}
        </div>
      }
      process={
        <button type="button" onClick={generate} className="btn-primary">
          Generate secure password
        </button>
      }
    />
  );
}
