"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [date, setDate] = useState("");
  let age = "—";
  if (date) {
    const birth = new Date(`${date}T00:00:00`);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    if (new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) > now) years -= 1;
    age = String(Math.max(0, years));
  }

  return (
    <IoWorkspace
      inputLabel="Date of birth"
      outputLabel="Your age"
      status={date ? "complete" : "idle"}
      input={<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field" />}
      output={
        <div>
          <p className="font-mono text-5xl font-semibold text-white">{age}</p>
          <p className="mt-2 text-sm text-ink-400">years old</p>
        </div>
      }
    />
  );
}
