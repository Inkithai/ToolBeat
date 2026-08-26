"use client";

import { useCallback } from "react";
import { formatJavaScript } from "@/lib/tools/code-format";
import TextTransform from "@/components/tools/text-transform";

export default function JsFormatterClient() {
  const transform = useCallback((input: string) => formatJavaScript(input), []);
  return (
    <TextTransform
      inputLabel="JavaScript"
      outputLabel="Formatted JavaScript"
      outputKind="code"
      placeholder="function add(a,b){return a+b;}"
      transform={transform}
    />
  );
}
