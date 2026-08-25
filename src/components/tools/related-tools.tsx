import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TOOLS } from "@/lib/tools/registry";
import type { ToolDefinition } from "@/lib/tools/types";

export default function RelatedTools({ current }: { current: ToolDefinition }) {
  const related = TOOLS.filter((tool) => tool.slug !== current.slug)
    .map((tool) => ({ tool, score: (tool.category === current.category ? 3 : 0) + tool.tags.filter((tag) => current.tags.includes(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .slice(0, 3)
    .map(({ tool }) => tool);

  if (!related.length) return null;
  return (
    <section className="mt-8" aria-labelledby="related-tools-heading">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-400">Keep going</p><h2 id="related-tools-heading" className="mt-1 text-lg font-extrabold text-white">You may also need</h2></div>
        <Link href="/tools" className="text-xs font-semibold text-indigo-300 hover:text-cyan-300">View all tools</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {related.map((tool) => <Link key={tool.slug} href={tool.href} className="card-hover rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"><span className="block text-sm font-bold text-white">{tool.name}</span><span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-ink-400">{tool.summary}</span><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-300">Open <ArrowRight className="h-3 w-3" aria-hidden="true" /></span></Link>)}
      </div>
    </section>
  );
}
