"use client";

import { useCallback, useState } from "react";
import { jsonToTypeScript } from "@/lib/tools/json-to-ts";
import TextTransform from "@/components/tools/text-transform";

export default function JsonToTypeScriptClient() {
  const [baseName, setBaseName] = useState("Root");

  const transform = useCallback(
    (input: string) => jsonToTypeScript(input, baseName || "Root"),
    [baseName],
  );

  return (
    <TextTransform
      inputLabel="JSON"
      outputLabel="TypeScript types"
      outputKind="code"
      placeholder='{"id":1,"name":"Ada","tags":["a","b"],"meta":{"count":3}}'
      transform={transform}
      options={
        <label className="flex items-center gap-2 text-xs text-ink-200">
          Base type name
          <input
            type="text"
            value={baseName}
            onChange={(event) => setBaseName(event.target.value)}
            placeholder="Root"
            className="field w-32 py-1.5 text-xs"
          />
        </label>
      }
    />
  );
}
