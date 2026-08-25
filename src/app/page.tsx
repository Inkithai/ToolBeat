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
import HeroSearch from "./hero-search";
import AmbientBackground from "@/components/layout/ambient-background";
import PersonalizedHome from "@/components/layout/personalized-home";
import WhyToolBeat from "@/components/layout/why-toolbeat";
import ProductProof from "@/components/layout/product-proof";
import { CATEGORIES, type CategoryKey } from "@/constants/app";
import { TOOLS, getToolsByCategory } from "@/lib/tools/registry";
import { isConversionTool } from "@/lib/tools/types";
import { describePlatformProcessing } from "@/lib/tools/capabilities";

const categoryStyles: Record<
  CategoryKey,
  { icon: typeof FileText; accent: string; iconWrap: string; iconColor: string }
> = {
  documents: {
    icon: FileText,
    accent: "hover:border-indigo-400/40",
    iconWrap: "bg-indigo-500/15 border-indigo-400/25 shadow-[0_0_24px_-8px_rgba(139,92,246,0.45)]",
    iconColor: "text-indigo-400",
  },
  images: {
    icon: Image,
    accent: "hover:border-indigo-400/40",
    iconWrap: "bg-indigo-500/15 border-indigo-400/25 shadow-[0_0_24px_-8px_rgba(139,92,246,0.45)]",
    iconColor: "text-indigo-400",
  },
  developer: {
    icon: Code2,
    accent: "hover:border-indigo-400/40",
    iconWrap: "bg-indigo-500/15 border-indigo-400/25 shadow-[0_0_24px_-8px_rgba(139,92,246,0.45)]",
    iconColor: "text-indigo-400",
  },
  utilities: {
    icon: Timer,
    accent: "hover:border-indigo-400/40",
    iconWrap: "bg-indigo-500/15 border-indigo-400/25 shadow-[0_0_24px_-8px_rgba(139,92,246,0.45)]",
    iconColor: "text-indigo-400",
  },
  calculators: {
    icon: Calculator,
    accent: "hover:border-indigo-400/40",
    iconWrap: "bg-indigo-500/15 border-indigo-400/25 shadow-[0_0_24px_-8px_rgba(139,92,246,0.45)]",
    iconColor: "text-indigo-400",
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
    tint: "from-indigo-500/20 to-transparent",
  },
  {
    icon: Zap,
    title: "Fast path to any tool",
    desc: "Search, browse categories, or use quick actions — get to work in seconds.",
    tint: "from-indigo-500/15 to-transparent",
  },
  {
    icon: Lock,
    title: "No account required",
    desc: "Open a tool, finish the job, download the result. Nothing to sign up for.",
    tint: "from-indigo-500/15 to-transparent",
  },
];



export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-navy-950">
      <main>
        {/* Hero */}
        <section className="relative px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
          <AmbientBackground variant="hero" />

          {/* Decorative orbit rings - REMOVED for Phase 2 (simplified visual system) */}

          <div className="relative mx-auto max-w-5xl text-center">
            {/* Eyebrow - Updated to show tool count */}
            <div className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-medium text-indigo-300 shadow-[0_0_24px_-8px_rgba(139,92,246,0.6)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              {TOOLS.length} useful tools · 100% browser-first
            </div>

            {/* NEW HEADLINE - Clearer positioning */}
            <h1 className="mb-5 animate-fade-up text-4xl font-extrabold leading-[1.08] tracking-tight text-white delay-1 sm:text-5xl lg:text-6xl">
              Do the task.
              <br className="hidden sm:block" />{" "}
              <span className="text-gradient-aurora">Not the signup.</span>
            </h1>

            {/* NEW SUBHEADLINE - More descriptive */}
            <p className="mx-auto mb-10 max-w-2xl animate-fade-up text-base leading-relaxed text-ink-300 delay-2 sm:text-lg">
              Convert files, format data, clean text, generate values, and calculate instantly —
              directly in your browser. Your files stay on your device.
            </p>

            {/* NEW HERO SEARCH - Replaces format picker */}
            <div className="animate-scale-in delay-3">
              <HeroSearch />
            </div>

            {/* Secondary CTA - Browse all tools */}
            <div className="mt-8 flex animate-fade-up flex-wrap items-center justify-center gap-3 delay-4">
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

        {/* PHASE 4: Personalized Home for returning users */}
        <PersonalizedHome />

        {/* Trust highlights - KEEP but with updated descriptions */}
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
          {/* Decorative blobs REMOVED for Phase 2 (simplified visual system) */}

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
                  Browse by category
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  What do you need to do?
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

        {/* PHASE 4: Why ToolBeat comparison section */}
        <WhyToolBeat />

        {/* PHASE 4: Product Proof section */}
        <ProductProof />

        {/* How it works - COMPRESSED per audit recommendation */}
        <section
          id="how-it-works"
          className="scroll-mt-20 relative border-t border-white/[0.05] px-4 py-12 sm:px-6 sm:py-16"
        >
          {/* Background gradient REMOVED for Phase 2 (simplified visual system) */}
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-400">
                Simple flow
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Find → Use → Done
              </h2>
              <p className="mt-2 text-sm text-ink-400">
                No account. No upload. No waiting.
              </p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative border-t border-white/[0.05] px-4 py-16 sm:px-6 sm:py-20">
          <div className="glass-panel animate-border-glow relative mx-auto max-w-4xl overflow-hidden px-6 py-14 text-center sm:px-12">
            {/* Decorative blobs and shimmer REMOVED for Phase 2 (simplified visual system) */}

            <div className="relative">
              <div className="mx-auto mb-5 flex h-14 w-14 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-[0_0_32px_-4px_rgba(139,92,246,0.7)]">
                <Zap className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                What&apos;s the next thing you need to get done?
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
