"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";
import { TOOLS } from "@/lib/tools/registry";
import { searchTools } from "@/lib/tools/search";

const QUICK_ACTIONS = [
  { label: "Convert a file", href: "/conversion/png-to-jpg" },
  { label: "Format JSON", href: "/tools/json-formatter" },
  { label: "Count words", href: "/tools/word-counter" },
  { label: "Generate password", href: "/tools/password-generator" },
  { label: "Calculate percentage", href: "/tools/percentage-calculator" },
];

const TRUST_INDICATORS = [
  { label: "No account required", icon: "✓" },
  { label: "Local processing where supported", icon: "✓" },
  { label: "Free to use", icon: "✓" },
  { label: `${TOOLS.length}+ tools ready`, icon: "✓" },
];

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate suggestions based on query
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const results = searchTools(TOOLS, query).slice(0, 5);
    setSuggestions(results.map(t => t.name));
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Try to find exact match first
      const exactMatch = TOOLS.find(t => t.name.toLowerCase() === query.toLowerCase() || t.slug === query.toLowerCase());
      if (exactMatch) {
        router.push(exactMatch.href);
        return;
      }
      // Otherwise go to tools directory with search query
      router.push(`/tools?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const match = TOOLS.find(t => t.name === suggestion);
    if (match) {
      router.push(match.href);
    } else {
      router.push(`/tools?search=${encodeURIComponent(suggestion)}`);
    }
  };

  return (
    <div className="relative mx-auto max-w-4xl animate-fade-up">
      {/* Main Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/25 bg-indigo-500/15 shadow-[0_0_20px_-6px_rgba(139,92,246,0.45)]">
            <Search className="h-5 w-5 text-indigo-300" aria-hidden="true" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you need to do?"
            className="field w-full py-4 pl-16 pr-4 text-base font-medium text-white placeholder:text-ink-500 sm:text-lg"
            aria-label="Search tools and tasks"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 transition-all duration-200 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Search"
          >
            <ArrowRight className="h-5 w-5 text-white" aria-hidden="true" />
          </button>
        </div>
        
        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-48 overflow-y-auto rounded-xl border border-indigo-400/25 bg-navy-900/95 backdrop-blur-xl shadow-2xl shadow-indigo-950/50">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left text-sm text-ink-200 hover:bg-indigo-500/10 hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Quick Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
          Quick actions
        </span>
        {QUICK_ACTIONS.map((action, index) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-ink-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/45 hover:bg-indigo-500/15 hover:text-white hover:shadow-[0_8px_20px_-12px_rgba(139,92,246,0.7)]"
            style={{ animationDelay: `${0.3 + index * 0.04}s` }}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {TRUST_INDICATORS.map((indicator, index) => (
          <div
            key={indicator.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 shadow-[0_0_24px_-8px_rgba(139,92,246,0.45)]"
            style={{ animationDelay: `${0.4 + index * 0.05}s` }}
          >
            <span className="text-indigo-400">{indicator.icon}</span>
            {indicator.label}
          </div>
        ))}
      </div>

      {/* Keyboard Shortcut Hint */}
      <p className="mt-4 text-center text-xs text-ink-500">
        Press <kbd className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-ink-300">Ctrl+K</kbd> for command palette
      </p>
    </div>
  );
}
