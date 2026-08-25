"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [value, setValue] = useState("");
  let ok = false;
  let message = "Paste JSON to validate";
  try {
    if (value.trim()) {
      JSON.parse(value);
      ok = true;
      message = "Valid JSON";
    }
  } catch (caught) {
    message = caught instanceof Error ? caught.message : "Invalid JSON";
  }

  return (
    <IoWorkspace
      status={value.trim() ? (ok ? "complete" : "error") : "idle"}
      input={
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="field min-h-64 font-mono"
          placeholder='{"name":"ToolBeat"}'
        />
      }
      output={
        <p className={`text-sm ${ok ? "text-cyan-300" : value.trim() ? "text-rose-300" : "text-ink-400"}`} role="status">
          {message}
        </p>
      }
    />
  );
}
