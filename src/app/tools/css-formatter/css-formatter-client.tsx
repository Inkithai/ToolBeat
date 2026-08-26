"use client";

import { useCallback } from "react";
import { formatCss } from "@/lib/tools/code-format";
import TextTransform from "@/components/tools/text-transform";

export default function CssFormatterClient() {
  const transform = useCallback((input: string) => formatCss(input), []);
  return (
    <TextTransform
      inputLabel="CSS"
      outputLabel="Formatted CSS"
      outputKind="code"
      placeholder=".card{padding:16px;color:#fff;background:#111}"
      transform={transform}
    />
  );
}
