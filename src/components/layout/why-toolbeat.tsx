"use client";

import { Check, X, ShieldCheck, Zap, Lock, Database, Search, Heart } from "lucide-react";

/**
 * Why ToolBeat? Comparison Section - Phase 4
 * 
 * Shows a comparison between ToolBeat and typical online tools
 * to highlight key differentiators.
 */

const comparisonData = [
  {
    feature: "One place for all tools",
    toolbeat: true,
    typical: false,
    description: "No need to bookmark multiple sites or remember different URLs",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    feature: "No account required",
    toolbeat: true,
    typical: false,
    description: "Start using tools immediately without sign-up walls",
    icon: <Lock className="h-5 w-5" />,
  },
  {
    feature: "Local processing",
    toolbeat: true,
    typical: false,
    description: "Your files stay on your device - nothing is uploaded to servers",
    icon: <Database className="h-5 w-5" />,
  },
  {
    feature: "Fast and focused",
    toolbeat: true,
    typical: false,
    description: "Clean interfaces without ads, distractions, or unnecessary steps",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    feature: "Personal toolbox",
    toolbeat: true,
    typical: false,
    description: "Save favorites and access recently used tools in one place",
    icon: <Heart className="h-5 w-5" />,
  },
  {
    feature: "Universal search",
    toolbeat: true,
    typical: false,
    description: "Find any tool instantly from the header or hero",
    icon: <Search className="h-5 w-5" />,
  },
];

interface ComparisonRowProps {
  feature: string;
  toolbeat: boolean;
  typical: boolean;
  description: string;
  icon: React.ReactNode;
}

function ComparisonRow({ feature, toolbeat, typical, description, icon }: ComparisonRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-4 border-b border-white/[0.05]">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-indigo-400 mt-0.5">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white">{feature}</h3>
          <p className="text-sm text-ink-500 mt-1">{description}</p>
        </div>
      </div>
      <div className="text-center">
        {toolbeat ? (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Check className="h-4 w-4" />
          </span>
        ) : (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink-800/50 text-ink-600">
            <X className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="text-center">
        {typical ? (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Check className="h-4 w-4" />
          </span>
        ) : (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink-800/50 text-ink-600">
            <X className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}

export default function WhyToolBeat() {
  return (
    <section className="relative border-t border-white/[0.05] px-4 py-16 sm:px-6 sm:py-20" aria-label="Why use ToolBeat">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] via-transparent to-transparent" />
      <div className="relative mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
            Why ToolBeat?
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            One toolbox. Less searching. More doing.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-400">
            ToolBeat gives you everything typical online tools don&apos;t — privacy, speed, and a single place for all your digital tasks.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="surface-raised overflow-hidden rounded-2xl border border-white/[0.08]">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-4 px-5 border-b border-white/[0.08] bg-navy-900/50">
            <div />
            <div className="text-center">
              <span className="font-bold text-white">ToolBeat</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-ink-400">Typical Tools</span>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="p-1">
            {comparisonData.map((row, index) => (
              <ComparisonRow key={index} {...row} />
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 text-center">
          <p className="text-sm text-ink-400">
            Stop juggling bookmarks. Start getting things done.
          </p>
        </div>
      </div>
    </section>
  );
}
