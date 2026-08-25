"use client";

import { useState, useEffect } from "react";
import { TOOLS } from "@/lib/tools/registry";
import { Code2, FileText, Calculator, Timer, Zap, Database, Lock } from "lucide-react";

/**
 * Product Proof Component - Phase 4
 * 
 * Shows real evidence of ToolBeat's value:
 * - Tool count
 * - Category breakdown
 * - Example tool previews
 */

// Icon mapping for categories
const categoryIcons: Record<string, typeof Code2> = {
  documents: FileText,
  images: FileText,
  developer: Code2,
  utilities: Timer,
  calculators: Calculator,
};

// Get category counts
function getCategoryCounts() {
  const counts: Record<string, number> = {};
  TOOLS.forEach(tool => {
    counts[tool.category] = (counts[tool.category] || 0) + 1;
  });
  return counts;
}

// Sample tool previews for demonstration
const samplePreviews = [
  {
    slug: "json-formatter",
    input: '{"name":"John","age":30}',
    output: `{\n  "name": "John",\n  "age": 30\n}`,
    title: "JSON Formatter",
    description: "Format and validate JSON instantly",
  },
  {
    slug: "word-counter",
    input: "This is a sample text for demonstration purposes.",
    output: "Words: 7, Characters: 45, Sentences: 1",
    title: "Word Counter",
    description: "Count words, characters, and sentences",
  },
  {
    slug: "percentage-calculator",
    input: "20% of 100",
    output: "20",
    title: "Percentage Calculator",
    description: "Calculate percentages instantly",
  },
];

// Stats to display
const stats = [
  {
    label: "Total Tools",
    value: TOOLS.length.toString(),
    description: "Browser-based tools ready to use",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    label: "Categories",
    value: Object.keys(getCategoryCounts()).length.toString(),
    description: "Organized for easy discovery",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Processing",
    value: "100%",
    description: "Runs in your browser - no uploads",
    icon: <Database className="h-5 w-5" />,
  },
  {
    label: "Account Required",
    value: "0",
    description: "No signup, no login, no friction",
    icon: <Lock className="h-5 w-5" />,
  },
];

// Animated counter for stats
function AnimatedCounter({ value, duration = 1000 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState("0");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const target = document.getElementById(`counter-${value}`);
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [value]);

  useEffect(() => {
    if (isVisible && !isNaN(parseInt(value))) {
      const end = parseInt(value);
      const start = 0;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuad = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOutQuad);
        setDisplayValue(current.toString());

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else if (isVisible) {
      setDisplayValue(value);
    }
  }, [isVisible, value, duration]);

  return (
    <span id={`counter-${value}`} className="text-2xl font-bold text-white sm:text-3xl">
      {displayValue}
    </span>
  );
}

// Tool preview component
function ToolPreview({ preview }: { preview: typeof samplePreviews[0] }) {
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOutput(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="surface card-hover relative overflow-hidden rounded-xl border border-white/[0.08] p-5 transition-all duration-300 hover:border-indigo-400/25">
      <div className="mb-4">
        <h3 className="font-bold text-white">{preview.title}</h3>
        <p className="text-xs text-ink-500">{preview.description}</p>
      </div>
      
      <div className="space-y-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-600">Input</span>
          <div className="mt-1 rounded-lg bg-navy-900 p-3 text-xs font-mono text-ink-300">
            {preview.input}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
          <Zap className="h-4 w-4 text-indigo-400" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-indigo-400/40 to-transparent" />
        </div>
        
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-600">Output</span>
          <div className="mt-1 rounded-lg bg-indigo-500/10 p-3 text-xs font-mono text-indigo-300">
            {showOutput ? preview.output : "Processing..."}
          </div>
        </div>
      </div>
    </div>
  );
}

// Category breakdown
function CategoryBreakdown() {
  const categoryCounts = getCategoryCounts();
  const categories = Object.entries(categoryCounts);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {categories.map(([category, count]) => {
        const Icon = categoryIcons[category] || Code2;
        return (
          <div
            key={category}
            className="surface flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] p-4 text-center"
          >
            <Icon className="h-6 w-6 text-indigo-400" />
            <span className="text-xs font-bold text-white">{count}</span>
            <span className="text-[11px] text-ink-500 truncate max-w-full">
              {category}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProductProof() {
  return (
    <section className="relative border-t border-white/[0.05] px-4 py-16 sm:px-6 sm:py-20" aria-label="Product proof">
      <div className="relative mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
            By the numbers
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Real tools. Real results.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-400">
            ToolBeat isn&apos;t just another tool directory — it&apos;s a complete workspace for getting digital tasks done.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="surface flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] p-5 text-center"
            >
              <div className="text-indigo-400">{stat.icon}</div>
              <AnimatedCounter value={stat.value} duration={1200 + index * 200} />
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
                {stat.label}
              </span>
              <p className="text-[11px] text-ink-600">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        <div className="mb-12">
          <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-ink-400">
            Tool Categories
          </h3>
          <CategoryBreakdown />
        </div>

        {/* Tool Previews */}
        <div>
          <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-ink-400">
            See it in action
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {samplePreviews.map((preview, index) => (
              <ToolPreview key={index} preview={preview} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
