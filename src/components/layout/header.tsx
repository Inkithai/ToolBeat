"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/constants/brand";
import BrandMark from "@/components/brand-mark";
import CommandPalette from "@/components/layout/command-palette";
import MyToolbox from "@/components/layout/my-toolbox";
import SearchTrigger from "@/components/layout/search-trigger";

const navLink = (active: boolean) =>
  `text-sm font-medium transition-colors ${active ? "text-white" : "text-ink-300 hover:text-white"}`;

export default function Header() {
  const pathname = usePathname();
  const onTools = pathname === "/tools" || pathname.startsWith("/tools/") || pathname.startsWith("/conversion");

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-navy-950/80 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" aria-hidden="true" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label={`${APP_NAME} Home`}>
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          <Link href="/tools" className={navLink(onTools)} aria-current={onTools ? "page" : undefined}>
            Explore tools
          </Link>
          <Link href="/#categories" className={navLink(false)}>
            Categories
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/tools" className={`md:hidden ${navLink(onTools)}`} aria-current={onTools ? "page" : undefined}>
            Tools
          </Link>
          <SearchTrigger variant="nav" />
          <MyToolbox />
          <CommandPalette />
        </div>
      </div>
    </header>
  );
}
