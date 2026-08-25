"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Command, Search, X } from "lucide-react";
import { TOOLS } from "@/lib/tools/registry";
import { searchTools } from "@/lib/tools/search";
import { isConversionTool } from "@/lib/tools/types";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchTools(TOOLS, query).slice(0, 8), [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 0);
    else setQuery("");
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-ink-400 transition-colors hover:border-indigo-400/30 hover:text-white sm:inline-flex" aria-label="Open command palette">
        <Command className="h-3.5 w-3.5" aria-hidden="true" /> Search <kbd className="rounded border border-white/10 px-1 text-[10px]">K</kbd>
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-navy-950/80 px-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Search ToolBeat">
          <button className="absolute inset-0 cursor-default" onClick={() => setOpen(false)} aria-label="Close search" />
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-indigo-400/25 bg-navy-900 shadow-2xl shadow-indigo-950/60">
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search className="h-5 w-5 text-indigo-300" aria-hidden="true" />
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools…" className="h-14 flex-1 bg-transparent text-white outline-none placeholder:text-ink-500" aria-label="Search tools" />
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 text-ink-400 hover:bg-white/10 hover:text-white" aria-label="Close command palette"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length ? results.map((tool) => (
                <Link key={tool.slug} href={tool.href} onClick={() => setOpen(false)} className="group flex items-center justify-between rounded-xl px-3 py-3 hover:bg-indigo-500/10 focus-visible:bg-indigo-500/10">
                  <span><span className="block font-semibold text-white">{isConversionTool(tool) ? `${tool.conversion.fromFormat} → ${tool.conversion.toFormat}` : tool.name}</span><span className="mt-0.5 block text-xs text-ink-500">{tool.summary}</span></span>
                  <ArrowRight className="h-4 w-4 text-ink-600 transition-transform group-hover:translate-x-1 group-hover:text-cyan-300" aria-hidden="true" />
                </Link>
              )) : <p className="px-3 py-8 text-center text-sm text-ink-400">No matching tools</p>}
            </div>
            <div className="border-t border-white/10 px-4 py-2 text-[11px] text-ink-500">Press <kbd className="text-ink-300">Esc</kbd> to close · {TOOLS.length} tools indexed</div>
          </div>
        </div>
      )}
    </>
  );
}
