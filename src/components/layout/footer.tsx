import Link from "next/link";
import { BRAND_NAME_PARTS, REPOSITORY_URL, TAGLINE } from "@/constants/brand";
import BrandMark from "@/components/brand-mark";
import { CATEGORIES } from "@/constants/app";
import { TOOLS } from "@/lib/tools/registry";
import { describePlatformProcessing } from "@/lib/tools/capabilities";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-navy-950">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3">
              <BrandMark compact />
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-ink-300">{TAGLINE}</p>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-500">
              {describePlatformProcessing(TOOLS)}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-ink-400">Explore</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools" className="text-ink-200 transition-colors hover:text-indigo-300">
                  All tools
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="text-ink-200 transition-colors hover:text-cyan-300">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/#why-convertlab" className="text-ink-200 transition-colors hover:text-indigo-300">
                  Why ConvertLab
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-ink-400">Categories</h2>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((category) => (
                <li key={category.key}>
                  <Link
                    href={`/tools?category=${category.key}`}
                    className="text-ink-200 transition-colors hover:text-indigo-300"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-ink-400">Project</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={REPOSITORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-200 transition-colors hover:text-indigo-300"
                >
                  Open source on GitHub
                </a>
              </li>
              <li className="text-ink-500">{TOOLS.length} tools available</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-ink-500 sm:flex-row sm:items-center">
          <p>Built with Next.js · Tailwind CSS · runs in your browser</p>
          <p className="text-ink-600">
            © {new Date().getFullYear()} {BRAND_NAME_PARTS.lead}
            {BRAND_NAME_PARTS.accent}
          </p>
        </div>
      </div>
    </footer>
  );
}
