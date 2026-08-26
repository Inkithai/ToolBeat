"use client";

import { useCallback } from "react";
import { jsonToSql } from "@/lib/tools/json-to-types";
import TextTransform from "@/components/tools/text-transform";

export default function Client() {
  const transform = useCallback((input: string) => jsonToSql(input), []);
  return (
    <TextTransform
      inputLabel="JSON"
      outputLabel="SQL CREATE TABLE"
      outputKind="code"
      placeholder='{"id": 1, "name": "Ada", "email": "ada@example.com", "active": true}'
      transform={transform}
    />
  );
}
