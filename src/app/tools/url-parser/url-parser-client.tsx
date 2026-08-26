"use client";

import { useMemo, useState } from "react";
import { parseUrl } from "@/lib/tools/url-tools";

function ComponentRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <span className="meta w-20 shrink-0 text-ink-500">{label}</span>
      <span className="break-all font-mono text-sm text-white">{value || "—"}</span>
    </div>
  );
}

export default function UrlParserClient() {
  const [input, setInput] = useState("https://example.com/shop?category=tools&page=2#top");
  const parsed = useMemo(() => parseUrl(input), [input]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Paste a URL…"
        className="field w-full font-mono text-sm"
      />

      {!parsed.valid ? (
        <p className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          {parsed.error}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <ComponentRow label="Protocol" value={parsed.protocol} />
            <ComponentRow label="Host" value={parsed.host} />
            <ComponentRow label="Hostname" value={parsed.hostname} />
            <ComponentRow label="Port" value={parsed.port} />
            <ComponentRow label="Path" value={parsed.pathname} />
            <ComponentRow label="Hash" value={parsed.hash} />
          </div>
          <div>
            <p className="meta mb-2 text-ink-500">
              Query parameters ({parsed.params.length})
            </p>
            {parsed.params.length === 0 ? (
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-ink-500">
                This URL has no query parameters.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-white/[0.06]">
                {parsed.params.map((pair, index) => (
                  <div
                    key={`${pair.key}-${index}`}
                    className={`flex items-start gap-3 px-3 py-2 ${index % 2 === 1 ? "bg-white/[0.02]" : ""}`}
                  >
                    <span className="break-all font-mono text-xs text-indigo-300">{pair.key}</span>
                    <span className="break-all font-mono text-xs text-white">{pair.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
