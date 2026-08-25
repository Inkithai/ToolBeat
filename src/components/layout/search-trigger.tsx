"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { isApplePlatform, openCommandPalette } from "@/lib/command-palette";

type SearchTriggerVariant = "hero" | "nav" | "cta";

const copy: Record<SearchTriggerVariant, { label: string; placeholder: string }> = {
  hero: {
    label: "Open tool search",
    placeholder: "What do you need to get done?",
  },
  nav: {
    label: "Search tools",
    placeholder: "Search tools…",
  },
  cta: {
    label: "Search for a tool",
    placeholder: "Search for a tool…",
  },
};

export default function SearchTrigger({
  variant,
  className = "",
}: {
  variant: SearchTriggerVariant;
  className?: string;
}) {
  const [modKey, setModKey] = useState("Ctrl");

  useEffect(() => {
    setModKey(isApplePlatform() ? "⌘" : "Ctrl");
  }, []);

  const { label, placeholder } = copy[variant];

  if (variant === "nav") {
    return (
      <button
        type="button"
        onClick={() => openCommandPalette()}
        className={`inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-navy-900 px-2.5 text-left text-sm text-ink-400 transition-colors hover:border-indigo-400/35 hover:text-ink-200 ${className}`}
        aria-label={label}
      >
        <Search className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
        <span className="hidden md:inline">{placeholder}</span>
        <kbd className="meta ml-1 hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] tracking-normal text-ink-400 lg:inline">
          {modKey}K
        </kbd>
      </button>
    );
  }

  const size = variant === "hero" ? "min-h-[72px] px-5 text-lg sm:text-xl" : "min-h-[60px] px-4 text-base sm:text-lg";

  return (
    <button
      type="button"
      onClick={() => openCommandPalette()}
      className={`group flex w-full items-center gap-4 rounded-xl border border-white/12 bg-navy-900 text-left shadow-[0_0_0_1px_rgba(139,92,246,0.08)] transition-[border-color,box-shadow] duration-200 hover:border-indigo-400/45 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.28)] ${size} ${className}`}
      aria-label={label}
    >
      <Search className="h-5 w-5 shrink-0 text-indigo-300 sm:h-6 sm:w-6" aria-hidden="true" />
      <span className="flex-1 font-medium text-ink-500 group-hover:text-ink-400">{placeholder}</span>
      <kbd className="meta hidden shrink-0 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] tracking-normal text-ink-300 sm:inline">
        {modKey}K
      </kbd>
    </button>
  );
}
