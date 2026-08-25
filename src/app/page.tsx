import Link from "next/link";
import { ArrowRight, FileText, Image, Code2, Timer, Calculator } from "lucide-react";
import HeroFormatPicker from "./hero-format-picker";
import { CATEGORIES, type CategoryKey } from "@/constants/app";
import { TOOLS, getToolsByCategory } from "@/lib/tools/registry";
import { isConversionTool } from "@/lib/tools/types";
import { describePlatformProcessing, describePlatformProcessingShort } from "@/lib/tools/capabilities";

const categoryStyles: Record<CategoryKey, { icon: typeof FileText; color: string; border: string; iconColor: string }> = {
  documents: { icon: FileText, color: "from-rose-400/20 to-rose-500/10", border: "border-rose-400/20", iconColor: "text-rose-400" },
  images: { icon: Image, color: "from-violet-400/20 to-violet-500/10", border: "border-violet-400/20", iconColor: "text-violet-400" },
  developer: { icon: Code2, color: "from-amber-400/20 to-amber-500/10", border: "border-amber-400/20", iconColor: "text-amber-400" },
  utilities: { icon: Timer, color: "from-emerald-400/20 to-emerald-500/10", border: "border-emerald-400/20", iconColor: "text-emerald-400" },
  calculators: { icon: Calculator, color: "from-indigo-400/20 to-indigo-500/10", border: "border-indigo-400/20", iconColor: "text-indigo-400" },
};

/**
 * Descriptions and counts are derived from the tool registry so a card can
 * never advertise a category that has no working tool behind it.
 *
 * Converter categories list their format names, which is the most useful
 * summary for them. Categories with no converters fall back to tool names,
 * because "PNG, JPG" has no equivalent for a stopwatch.
 */
const categories = CATEGORIES.map((category) => {
  const tools = getToolsByCategory(category.key);
  const formats = Array.from(
    new Set(
      tools.flatMap((tool) =>
        isConversionTool(tool) ? [tool.conversion.fromFormat, tool.conversion.toFormat] : []
      )
    )
  );
  return {
    ...category,
    ...categoryStyles[category.key],
    count: tools.length,
    summary: formats.length ? formats.join(", ") : tools.map((tool) => tool.name).join(", "),
  };
});

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-950 overflow-hidden">
      <main>
      {/* Hero — the format picker is the primary action, so the first viewport
          shows what the product converts instead of requiring a scroll. */}
      <section className="relative px-6 pb-14 pt-16 sm:pt-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-6 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {describePlatformProcessingShort(TOOLS)}
          </div>
          <h1 className="mb-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-white animate-fade-up sm:text-5xl lg:text-6xl" style={{ animationDelay: "0.1s" }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">Useful tools.</span> Right in your browser.
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-ink-200 animate-fade-up sm:text-lg" style={{ animationDelay: "0.2s" }}>
            Files, code, productivity, calculations and more. {describePlatformProcessing(TOOLS)}
          </p>
          <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <HeroFormatPicker />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="px-6 py-16 border-t border-white/5">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Browse by category</h2>
              <p className="mt-1.5 text-sm text-ink-200">{TOOLS.length} tools across {CATEGORIES.length} categories.</p>
            </div>
            <Link href="/tools" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">View every tool →</Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={`/tools?category=${cat.key}`}
                className={`group relative flex flex-col rounded-2xl border p-5 ${cat.border} bg-gradient-to-br ${cat.color} transition-all hover:-translate-y-1 hover:border-white/20`}
              >
                <cat.icon className={`mb-3 h-7 w-7 ${cat.iconColor}`} />
                <h3 className="mb-1 text-base font-bold text-white">{cat.label}</h3>
                <p className="mb-4 text-xs leading-relaxed text-ink-200">{cat.summary}</p>
                {/* Always visible, so touch users get the same affordance as hover. */}
                <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-ink-100">
                  {cat.count} {cat.count === 1 ? "tool" : "tools"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-16 border-t border-white/5 bg-gradient-to-b from-navy-950 to-navy-900/40">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">How it works</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { step: "01", title: "Choose formats", desc: "Pick your input and output format, or jump straight to a tool from the directory." },
              { step: "02", title: "Add your file", desc: "Drag and drop, or click to browse. The file is read by your browser and never sent anywhere." },
              { step: "03", title: "Download", desc: "Conversion runs locally and finishes in moments. Save the result with one click." },
            ].map((s) => (
              <div key={s.step} className="relative rounded-xl bg-white/[0.03] border border-white/5 p-5 sm:p-6">
                <span className="text-5xl font-black text-white/5 absolute top-4 right-6 select-none">{s.step}</span>
                <h3 className="mb-2 text-lg font-bold text-white">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ink-200">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      </main>
    </div>
  );
}
