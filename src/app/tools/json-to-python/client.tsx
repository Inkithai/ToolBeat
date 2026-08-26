"use client";

import { useCallback } from "react";
import { jsonToPython } from "@/lib/tools/json-to-types";
import TextTransform from "@/components/tools/text-transform";

export default function Client() {
  const transform = useCallback((input: string) => jsonToPython(input), []);
  return (
    <TextTransform
      inputLabel="JSON"
      outputLabel="Python dataclasses"
      outputKind="code"
      placeholder='{"id": 1, "name": "Ada", "tags": ["a", "b"], "active": true}'
      transform={transform}
    />
  );
}
