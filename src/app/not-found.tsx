import Link from "next/link";
import { Home, Search, Wrench } from "lucide-react";

/**
 * Custom 404 page matching the ConvertLab brand.
 * Guides lost users toward the search and directory instead of dead-ending.
 */
export default function NotFound() {
  return (
    <main className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <Wrench className="h-7 w-7 text-ink-500" />
      </div>

      <p className="meta mb-3 text-ink-500">404 — Page not found</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        This tool doesn&apos;t exist <span className="text-ink-500">(yet)</span>
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-400">
        The page you&apos;re looking for may have been moved, renamed, or hasn&apos;t been built yet.
        Here are some ways to find what you need:
      </p>

      <div className="mt-8 grid w-full max-w-sm gap-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-indigo-400/30 hover:bg-white/[0.05]"
        >
          <Home className="h-5 w-5 shrink-0 text-indigo-400" />
          <div>
            <p className="text-sm font-semibold text-white">Back to home</p>
            <p className="text-xs text-ink-500">Browse all {">"}175 tools</p>
          </div>
        </Link>
        <Link
          href="/tools"
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-indigo-400/30 hover:bg-white/[0.05]"
        >
          <Search className="h-5 w-5 shrink-0 text-indigo-400" />
          <div>
            <p className="text-sm font-semibold text-white">Tool directory</p>
            <p className="text-xs text-ink-500">Search and filter by category</p>
          </div>
        </Link>
      </div>

      <p className="meta mt-8 text-ink-600">
        Looking for a tool we don&apos;t have? Check the roadmap in the project docs.
      </p>
    </main>
  );
}
