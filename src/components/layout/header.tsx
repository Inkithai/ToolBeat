"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Wrench } from "lucide-react";
import { APP_NAME } from "@/constants/brand";
import BrandMark from "@/components/brand-mark";
import CommandPalette from "@/components/layout/command-palette";

const navLink = (active: boolean) =>
  `text-sm font-medium transition-colors ${
    active ? "text-white" : "text-ink-300 hover:text-white"
  }`;

export default function Header() {
  const pathname = usePathname();
  const onTools = pathname === "/tools" || pathname.startsWith("/tools/");
  const onConversion = pathname.startsWith("/conversion");

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-navy-950/70 backdrop-blur-xl">
      {/* Top aurora line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"
        aria-hidden="true"
      />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${APP_NAME} Home`}>
          <BrandMark />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
          <CommandPalette />
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
          <Link
            href="/#how-it-works"
            className={`hidden rounded-lg px-3 py-2 md:inline-block ${navLink(false)}`}
          >
            How it works
          </Link>
          <Link
            href="/tools"
            className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-[length:140%_140%] px-3.5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[position:100%_50%] hover:shadow-indigo-500/50"
          >
            Browse tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
