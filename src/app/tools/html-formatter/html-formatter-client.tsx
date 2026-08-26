"use client";

import { useCallback } from "react";
import { formatHtml } from "@/lib/tools/code-format";
import TextTransform from "@/components/tools/text-transform";

export default function HtmlFormatterClient() {
  const transform = useCallback((input: string) => formatHtml(input), []);
  return (
    <TextTransform
      inputLabel="HTML"
      outputLabel="Formatted HTML"
      outputKind="code"
      placeholder="<div><span>Hello</span><p>World</p></div>"
      transform={transform}
    />
  );
}
