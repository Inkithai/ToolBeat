import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Image,
  Code2,
  Timer,
  Calculator,
  ShieldCheck,
  Zap,
  Lock,
} from "lucide-react";
import HeroFormatPicker from "./hero-format-picker";
import AmbientBackground from "@/components/layout/ambient-background";
import { CATEGORIES, type CategoryKey } from "@/constants/app";
import { TOOLS, getToolsByCategory } from "@/lib/tools/registry";
import { isConversionTool } from "@/lib/tools/types";
import { describePlatformProcessing, describePlatformProcessingShort } from "@/lib/tools/capabilities";

const categoryStyles: Record<
  CategoryKey,
  { icon: typeof FileText; accent: string; iconWrap: string; iconColor: string }
> = {
  documents: {
    icon: FileText,
    accent: "hover:border-rose-400/40",
    iconWrap: "bg-rose-500/15 border-rose-400/25 shadow-[0_0_24px_-8px_rgba(251,113,133,0.5)]",
    iconColor: "text-rose-400",
  },
  images: {
    icon: Image,
    accent: "hover:border-fuchsia-400/40",
    iconWrap: "bg-fuchsia-500/15 border-fuchsia-400/25 shadow-[0_0_24px_-8px_rgba(232,121,249,0.5)]",
    iconColor: "text-fuchsia-400",
  },
  developer: {
    icon: Code2,
    accent: "hover:border-amber-400/40",
    iconWrap: "bg-amber-500/15 border-amber-400/25 shadow-[0_0_24px_-8px_rgba(251,191,36,0.45)]",
    iconColor: "text-amber-400",
  },
  utilities: {
    icon: Timer,
    accent: "hover:border-emerald-400/40",
    iconWrap: "bg-emerald-500/15 border-emerald-400/25 shadow-[0_0_24px_-8px_rgba(52,211,153,0.45)]",
    iconColor: "text-emerald-400",
  },
  calculators: {
    icon: Calculator,
    accent: "hover:border-cyan-400/40",
    iconWrap: "bg-cyan-500/15 border-cyan-400/25 shadow-[0_0_24px_-8px_rgba(34,211,238,0.5)]",
    iconColor: "text-cyan-400",
  },
};

/**
 * Descriptions and counts are derived from the tool registry so a card can
 * never advertise a category that has no working tool behind it.
 */
const categories = CATEGORIES.map((category) => {
  const tools = getToolsByCategory(category.key);
  const formats = Array.from(
    new Set(
      tools.flatMap((tool) =>
        isConversionTool(tool) ? [tool.conversion.fromFormat, tool.conversion.toFormat] : [],
      ),
    ),
  );
  return {
    ...category,
    ...categoryStyles[category.key],
    count: tools.length,
    summary: formats.length ? formats.join(", ") : tools.map((tool) => tool.name).join(", "),
  };
});

const highlights = [
  {
    icon: ShieldCheck,
    title: "Private by design",
    desc: describePlatformProcessing(TOOLS),
    tint: "from-violet-500/20 to-transparent",
  },
  {
    icon: Zap,
    title: "Fast path to any tool",
    desc: "Pick formats in the hero, search the directory, or jump from a category — two clicks max.",
    tint: "from-cyan-500/15 to-transparent",
  },
  {
    icon: Lock,
    title: "No account required",
    desc: "Open a tool, finish the job, download the result. Nothing to sign up for.",
    tint: "from-fuchsia-500/15 to-transparent",
  },
];

const steps = [
  {
    step: "01",
    title: "Find your tool",
    desc: "Choose formats below, browse a category, or open the full directory with search and filters.",
  },
  {
    step: "02",
    title: "Add your input",
    desc: "Drop a file or paste text. Work stays in your browser — nothing is uploaded to a server.",
  },
  {
    step: "03",
    title: "Get the result",
    desc: "Convert, format, or calculate locally, then download or copy the output in one click.",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-navy-950">
      <main>
        {/* Hero */}
        <section className="relative px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
          <AmbientBackground variant="hero" />

          {/* Decorative orbit rings */}
          <div
            className="pointer-events-none absolute left-1/2 top-24 hidden h-[520px] w-[520px] -translate-x-1/2 lg:block"
            aria-hidden="true"
          >
            <div className="orbit-ring absolute inset-0 opacity-40" />
            <div
              className="orbit-ring absolute inset-10 opacity-25"
              style={{ animationDirection: "reverse", animationDuration: "32s" }}
            />
            <div className="orbit-ring absolute inset-24 opacity-15" style={{ animationDuration: "40s" }} />
          </div>

          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-medium text-indigo-300 shadow-[0_0_24px_-8px_rgba(139,92,246,0.6)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              {describePlatformProcessingShort(TOOLS)} · {TOOLS.length} tools ready
            </div>

            <h1 className="mb-5 animate-fade-up text-4xl font-extrabold leading-[1.08] tracking-tight text-white delay-1 sm:text-5xl lg:text-6xl">
              Useful tools.
              <br className="hidden sm:block" />{" "}
              <span className="text-gradient-aurora">Right in your browser.</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl animate-fade-up text-base leading-relaxed text-ink-300 delay-2 sm:text-lg">
              Convert files, format code, count words, run timers and more — without accounts,
              uploads, or waiting on a server.
            </p>

            <div className="animate-scale-in delay-3">
              <HeroFormatPicker />
            </div>

            <div className="mt-6 flex animate-fade-up flex-wrap items-center justify-center gap-3 delay-4">
              <Link href="/tools" className="btn-secondary text-sm">
                Browse all {TOOLS.length} tools
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/#categories"
                className="text-sm font-semibold text-ink-400 transition-colors hover:text-cyan-300"
              >
                Or pick a category ↓
              </Link>
            </div>
          </div>
        </section>

        {/* Trust highlights */}
        <section className="relative border-t border-white/[0.05] px-4 py-12 sm:px-6" aria-label="Why ToolBeat">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
            {highlights.map((item, index) => (
              <div
                key={item.title}
                className={`surface card-hover relative overflow-hidden flex gap-4 p-5 animate-fade-up delay-${index + 2}`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.tint} opacity-80`}
                  aria-hidden="true"
                />
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/25 bg-indigo-500/15 shadow-[0_0_20px_-6px_rgba(139,92,246,0.55)]">
                  <item.icon className="h-5 w-5 text-indigo-300" aria-hidden="true" />
                </div>
                <div className="relative">
                  <h2 className="text-sm font-bold text-white">{item.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="scroll-mt-20 relative border-t border-white/[0.05] px-4 py-16 sm:px-6 sm:py-20">
          <div className="pointer-events-none absolute right-0 top-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" aria-hidden="true" />
          <div className="pointer-events-none absolute left-0 bottom-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-[90px]" aria-hidden="true" />

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
                  Browse by category
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Start where you already know the job
                </h2>
                <p className="mt-2 max-w-xl text-sm text-ink-400">
                  {TOOLS.length} tools across {CATEGORIES.length} categories — each card opens a
                  filtered directory, not a single random tool.
                </p>
              </div>
              <Link
                href="/tools"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-300 transition-colors hover:text-cyan-300"
              >
                View every tool
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat, index) => (
                <Link
                  key={cat.key}
                  href={`/tools?category=${cat.key}`}
                  className={`group surface card-hover flex flex-col p-5 animate-fade-up ${cat.accent}`}
                  style={{ animationDelay: `${0.05 + index * 0.06}s` }}
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${cat.iconWrap}`}
                  >
                    <cat.icon className={`h-5 w-5 ${cat.iconColor}`} aria-hidden="true" />
                  </div>
                  <h3 className="mb-1 text-base font-bold text-white">{cat.label}</h3>
                  <p className="mb-5 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-400">
                    {cat.summary}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-200">
                    {cat.count} {cat.count === 1 ? "tool" : "tools"}
                    <ArrowRight className="h-3.5 w-3.5 text-indigo-400 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-cyan-400" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular tools + collections */}
        <section className="relative border-t border-white/[0.05] px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="popular-tools-heading">
          <div className="relative mx-auto max-w-6xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Popular starting points</p>
                <h2 id="popular-tools-heading" className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">The tools people reach for first</h2>
              </div>
              <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-300 hover:text-cyan-300">Explore the directory <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.filter((tool) => ["json-formatter", "uuid-generator", "word-counter", "base64-encoder", "percentage-calculator", "pomodoro"].includes(tool.slug)).map((tool) => (
                <Link key={tool.slug} href={tool.href} className="card-hover group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">{tool.category}</span>
                  <h3 className="mt-2 text-base font-bold text-white group-hover:text-indigo-200">{tool.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-400">{tool.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-300">Open tool <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Tool collections">
              {[{ name: "Developer essentials", tag: "developer", desc: "Format, encode, decode, and inspect data." }, { name: "Everyday productivity", tag: "utilities", desc: "Timers, reading, text, and quick calculations." }, { name: "File conversion", tag: "documents", desc: "Move between common document formats locally." }].map((collection) => (
                <Link key={collection.tag} href={`/tools?category=${collection.tag}`} className="rounded-xl border border-indigo-400/15 bg-indigo-500/[0.06] p-4 transition-colors hover:border-indigo-400/35 hover:bg-indigo-500/10">
                  <h3 className="text-sm font-bold text-white">{collection.name}</h3><p className="mt-1 text-xs leading-relaxed text-ink-400">{collection.desc}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-300">View collection <ArrowRight className="h-3 w-3" aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-20 relative border-t border-white/[0.05] px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/[0.04] via-transparent to-cyan-500/[0.04]" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-400">
                Simple flow
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Three steps. No detours.
              </h2>
            </div>
            <ol className="grid gap-4 md:grid-cols-3">
              {steps.map((s, index) => (
                <li
                  key={s.step}
                  className="surface-raised card-hover relative overflow-hidden p-6"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />
                  <span className="absolute right-5 top-4 select-none text-4xl font-black text-white/[0.04]">
                    {s.step}
                  </span>
                  <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 text-xs font-bold text-indigo-200 shadow-[0_0_18px_-4px_rgba(139,92,246,0.6)]">
                    {index + 1}
                  </span>
                  <h3 className="mb-2 text-lg font-bold text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-400">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative border-t border-white/[0.05] px-4 py-16 sm:px-6 sm:py-20">
          <div className="glass-panel animate-border-glow relative mx-auto max-w-4xl overflow-hidden px-6 py-14 text-center sm:px-12">
            <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-indigo-500/25 blur-[80px]" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-[70px]" />
            <div className="pointer-events-none absolute inset-0 animate-shimmer opacity-40" />

            <div className="relative">
              <div className="mx-auto mb-5 flex h-14 w-14 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-[0_0_32px_-4px_rgba(139,92,246,0.7)]">
                <Zap className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Ready when you are
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-300 sm:text-base">
                Open the directory, filter by what you need, and finish the task in your browser.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/tools" className="btn-primary">
                  Open tool directory
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/#categories" className="btn-secondary">
                  Browse categories
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
