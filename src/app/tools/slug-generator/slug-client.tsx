"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function SlugClient() {
  const [text, setText] = useState("");
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return (
    <IoWorkspace
      inputLabel="Title or phrase"
      outputLabel="Generated slug"
      status={slug ? "complete" : "idle"}
      input={
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="field min-h-32 resize-y"
          placeholder="My useful blog post"
        />
      }
      output={<p className="break-all font-mono text-lg text-cyan-200">{slug || "your-slug-will-appear-here"}</p>}
    />
  );
}
