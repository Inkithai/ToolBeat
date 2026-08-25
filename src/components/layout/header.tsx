"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ArrowRight, Wrench, Search, Command, X } from "lucide-react";
import { APP_NAME } from "@/constants/brand";
import BrandMark from "@/components/brand-mark";
import CommandPalette from "@/components/layout/command-palette";
import MyToolbox from "@/components/layout/my-toolbox";
import { TOOLS } from "@/lib/tools/registry";
import { searchTools } from "@/lib/tools/search";

const navLink = (active: boolean) =>
  `text-sm font-medium transition-colors ${
    active ? "text-white" : "text-ink-300 hover:text-white"
  }`;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const onTools = pathname === "/tools" || pathname.startsWith("/tools/");
  const onConversion = pathname.startsWith("/conversion");
  
  // Search state for header search bar
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Generate suggestions for header search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    const results = searchTools(TOOLS, searchQuery).slice(0, 5);
    setSearchSuggestions(results.map(t => t.name));
  }, [searchQuery]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const exactMatch = TOOLS.find(t => t.name.toLowerCase() === searchQuery.toLowerCase() || t.slug === searchQuery.toLowerCase());
      if (exactMatch) {
        router.push(exactMatch.href);
        setSearchQuery("");
        setSearchOpen(false);
        return;
      }
      router.push(`/tools?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    const match = TOOLS.find(t => t.name === suggestion);
    if (match) {
      router.push(match.href);
    } else {
      router.push(`/tools?search=${encodeURIComponent(suggestion)}`);
    }
    setSearchQuery("");
    setSearchOpen(false);
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchOpen && searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-navy-950/70 backdrop-blur-xl">
      {/* Top indigo line - simplified for Phase 2 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"
        aria-hidden="true"
      />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${APP_NAME} Home`}>
          <BrandMark />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
          {/* SEARCH BAR - Always visible on desktop, prominent on mobile */}
          <div className="relative hidden sm:flex" ref={searchInputRef}>
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-400/25 bg-indigo-500/10">
              <Search className="h-4 w-4 text-indigo-300" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search tools..."
              className="w-48 bg-navy-900 pl-11 pr-3 text-sm text-white placeholder:text-ink-500 outline-none transition-all duration-200 hover:w-64 focus:w-64 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/20"
              aria-label="Search tools"
              autoComplete="off"
            />
            {searchOpen && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-indigo-400/25 bg-navy-900/95 backdrop-blur-xl shadow-2xl shadow-indigo-950/50">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left text-sm text-ink-200 hover:bg-indigo-500/10 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* My Toolbox - Phase 3 */}
          <MyToolbox />
          
          {/* Command Palette - for keyboard users */}
          <CommandPalette />
          
          {/* Navigation Links */}
          <Link
            href="/tools"
            className={`hidden items-center gap-1.5 rounded-lg px-3 py-2 sm:inline-flex ${navLink(onTools && !onConversion)}`}
            aria-current={onTools && !onConversion ? "page" : undefined}
          >
            <Wrench className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            All tools
          </Link>
          <Link
            href="/#categories"
            className={`hidden rounded-lg px-3 py-2 sm:inline-block ${navLink(false)}`}
          >
            Categories
          </Link>
          
          {/* Browse tools CTA */}
          <Link
            href="/tools"
            className="ml-1 hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-3.5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-400 hover:to-indigo-500 sm:inline-flex"
          >
            Browse tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
        
        {/* Mobile search button */}
        <button
          type="button"
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/25 bg-indigo-500/10 sm:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5 text-indigo-300" />
        </button>
      </div>
      
      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-40 bg-navy-950/90 backdrop-blur-sm sm:hidden" role="dialog" aria-modal="true" aria-label="Search ToolBeat">
          <button className="absolute inset-0 cursor-default" onClick={() => setSearchOpen(false)} aria-label="Close search" />
          <div className="absolute top-4 left-4 right-4">
            <div className="relative flex items-center gap-3 rounded-xl border border-indigo-400/25 bg-navy-900 shadow-2xl shadow-indigo-950/50">
              <div className="pointer-events-none flex h-12 w-12 items-center justify-center rounded-l-xl border-r border-indigo-400/25 bg-indigo-500/15">
                <Search className="h-5 w-5 text-indigo-300" aria-hidden="true" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="flex-1 bg-transparent py-3 text-white outline-none placeholder:text-ink-500"
                aria-label="Search tools"
                autoComplete="off"
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="rounded-r-xl p-3 text-ink-400 hover:bg-white/10 hover:text-white" aria-label="Close search"><X className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
