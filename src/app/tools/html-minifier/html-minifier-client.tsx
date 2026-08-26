"use client";

import { useCallback, useState } from "react";
import TextTransform from "@/components/tools/text-transform";
import { minifyHtml } from "@/lib/tools/minify-html";
import { formatBytes } from "@/lib/tools/image-ops";

export default function HtmlMinifierClient() {
  const [stats, setStats] = useState<{ before: number; after: number; pct: number } | null>(null);

  const transform = useCallback((input: string) => {
    const output = minifyHtml(input);
    const before = new TextEncoder().encode(input).length;
    const after = new TextEncoder().encode(output).length;
    setStats({ before, after, pct: before > 0 ? Math.max(0, (1 - after / before) * 100) : 0 });
    return output;
  }, []);

  return (
    <TextTransform
      inputLabel="HTML"
      outputLabel="Minified"
      live
      outputKind="code"
      placeholder="Paste HTML to minify…"
      transform={transform}
      options={
        stats ? (
          <div className="flex items-center">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
              {formatBytes(stats.before)} → {formatBytes(stats.after)} (−{stats.pct.toFixed(1)}%)
            </span>
          </div>
        ) : undefined
      }
    />
  );
}
