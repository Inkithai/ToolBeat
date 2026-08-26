"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

const MIME_TYPES: Record<string, { type: string; extensions: string[]; category: string }> = {
  "text/html": { type: "text/html", extensions: [".html", ".htm"], category: "Text" },
  "text/css": { type: "text/css", extensions: [".css"], category: "Text" },
  "text/javascript": { type: "text/javascript", extensions: [".js", ".mjs"], category: "Text" },
  "text/plain": { type: "text/plain", extensions: [".txt"], category: "Text" },
  "text/csv": { type: "text/csv", extensions: [".csv"], category: "Text" },
  "text/xml": { type: "text/xml", extensions: [".xml"], category: "Text" },
  "text/markdown": { type: "text/markdown", extensions: [".md"], category: "Text" },

  "application/json": { type: "application/json", extensions: [".json"], category: "Application" },
  "application/xml": { type: "application/xml", extensions: [".xml"], category: "Application" },
  "application/pdf": { type: "application/pdf", extensions: [".pdf"], category: "Application" },
  "application/zip": { type: "application/zip", extensions: [".zip"], category: "Application" },
  "application/gzip": { type: "application/gzip", extensions: [".gz", ".gzip"], category: "Application" },
  "application/x-tar": { type: "application/x-tar", extensions: [".tar"], category: "Application" },
  "application/x-7z-compressed": { type: "application/x-7z-compressed", extensions: [".7z"], category: "Application" },
  "application/x-rar-compressed": { type: "application/x-rar-compressed", extensions: [".rar"], category: "Application" },
  "application/javascript": { type: "application/javascript", extensions: [".js"], category: "Application" },
  "application/octet-stream": { type: "application/octet-stream", extensions: [".bin"], category: "Application" },
  "application/x-www-form-urlencoded": { type: "application/x-www-form-urlencoded", extensions: [], category: "Application" },
  "application/graphql": { type: "application/graphql", extensions: [".graphql"], category: "Application" },
  "application/wasm": { type: "application/wasm", extensions: [".wasm"], category: "Application" },
  "application/ld+json": { type: "application/ld+json", extensions: [".jsonld"], category: "Application" },
  "application/manifest+json": { type: "application/manifest+json", extensions: [".webmanifest"], category: "Application" },
  "application/rtf": { type: "application/rtf", extensions: [".rtf"], category: "Application" },
  "application/x-shockwave-flash": { type: "application/x-shockwave-flash", extensions: [".swf"], category: "Application" },

  "image/jpeg": { type: "image/jpeg", extensions: [".jpg", ".jpeg"], category: "Image" },
  "image/png": { type: "image/png", extensions: [".png"], category: "Image" },
  "image/gif": { type: "image/gif", extensions: [".gif"], category: "Image" },
  "image/webp": { type: "image/webp", extensions: [".webp"], category: "Image" },
  "image/svg+xml": { type: "image/svg+xml", extensions: [".svg"], category: "Image" },
  "image/bmp": { type: "image/bmp", extensions: [".bmp"], category: "Image" },
  "image/x-icon": { type: "image/x-icon", extensions: [".ico"], category: "Image" },
  "image/tiff": { type: "image/tiff", extensions: [".tiff", ".tif"], category: "Image" },
  "image/avif": { type: "image/avif", extensions: [".avif"], category: "Image" },

  "audio/mpeg": { type: "audio/mpeg", extensions: [".mp3"], category: "Audio" },
  "audio/ogg": { type: "audio/ogg", extensions: [".ogg"], category: "Audio" },
  "audio/wav": { type: "audio/wav", extensions: [".wav"], category: "Audio" },
  "audio/webm": { type: "audio/webm", extensions: [".weba"], category: "Audio" },
  "audio/aac": { type: "audio/aac", extensions: [".aac"], category: "Audio" },
  "audio/flac": { type: "audio/flac", extensions: [".flac"], category: "Audio" },

  "video/mp4": { type: "video/mp4", extensions: [".mp4"], category: "Video" },
  "video/webm": { type: "video/webm", extensions: [".webm"], category: "Video" },
  "video/ogg": { type: "video/ogg", extensions: [".ogv"], category: "Video" },
  "video/mpeg": { type: "video/mpeg", extensions: [".mpeg"], category: "Video" },
  "video/x-msvideo": { type: "video/x-msvideo", extensions: [".avi"], category: "Video" },
  "video/quicktime": { type: "video/quicktime", extensions: [".mov"], category: "Video" },

  "font/woff": { type: "font/woff", extensions: [".woff"], category: "Font" },
  "font/woff2": { type: "font/woff2", extensions: [".woff2"], category: "Font" },
  "font/ttf": { type: "font/ttf", extensions: [".ttf"], category: "Font" },
  "font/otf": { type: "font/otf", extensions: [".otf"], category: "Font" },
};

export default function Client() {
  const [query, setQuery] = useState("");
  const [selectedMime, setSelectedMime] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return Object.values(MIME_TYPES);
    return Object.values(MIME_TYPES).filter(
      m => m.type.includes(q) ||
        m.extensions.some(e => e.includes(q)) ||
        m.category.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const m of filtered) {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    }
    return groups;
  }, [filtered]);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  };

  const selected = selectedMime && MIME_TYPES[selectedMime];

  return (
    <IoWorkspace
      inputLabel="Search MIME types"
      outputLabel="MIME type details"
      status={selected ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by type, extension or category..."
            className="field w-full"
            autoFocus
          />
          <div className="max-h-[18rem] overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.02]">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <p className="sticky top-0 z-10 border-b border-white/[0.06] bg-navy-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
                  {cat}
                </p>
                {items.map(m => (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => setSelectedMime(m.type)}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-left transition-colors ${
                      selectedMime === m.type ? "bg-indigo-500/10" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="font-mono text-xs text-indigo-300">{m.type}</span>
                    <span className="text-[10px] text-ink-500">{m.extensions.join(", ")}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-ink-600">{filtered.length} MIME types in database</p>
        </div>
      }
      output={
        selected ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center">
              <code className="font-mono text-2xl font-bold text-white">{selected.type}</code>
              <p className="mt-1 text-xs text-ink-500">{selected.category}</p>
            </div>
            {selected.extensions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">File extensions</p>
                <div className="flex flex-wrap gap-2">
                  {selected.extensions.map(ext => (
                    <button
                      key={ext}
                      type="button"
                      onClick={() => copy(ext)}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-sm text-ink-200 transition-colors hover:text-white"
                    >
                      {copied === ext ? "✓" : ""} {ext}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-xs text-ink-400">Use in HTTP headers:</p>
              <pre className="mt-2 font-mono text-xs text-cyan-300">Content-Type: {selected.type}</pre>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            Search or select a MIME type
          </div>
        )
      }
    />
  );
}
