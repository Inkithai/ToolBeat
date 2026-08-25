"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TOOLS, getToolsByCategory } from "@/lib/tools/registry";

/**
 * Related Tools Component - Phase 3
 * 
 * Shows related tools based on:
 * - Same category
 * - Similar tags
 * - Common workflows
 */

// Define tool relationships for better suggestions
const TOOL_RELATIONSHIPS: Record<string, string[]> = {
  // Developer tools relationships
  "json-formatter": ["json-validator", "yaml-to-json", "json-to-yaml", "json-to-csv"],
  "json-validator": ["json-formatter", "yaml-to-json", "json-to-yaml"],
  "yaml-to-json": ["json-formatter", "json-validator", "json-to-yaml", "xml-to-json"],
  "json-to-yaml": ["json-formatter", "json-validator", "yaml-to-json"],
  "csv-to-json": ["json-formatter", "json-to-csv", "csv-to-markdown"],
  "json-to-csv": ["json-formatter", "csv-to-json", "csv-to-markdown"],
  "xml-to-json": ["json-formatter", "json-validator", "yaml-to-json"],
  "json-to-xml": ["json-formatter", "xml-to-json"],
  "base64-encoder": ["url-encoder", "jwt-decoder", "text-case-converter"],
  "url-encoder": ["base64-encoder", "jwt-decoder"],
  "jwt-decoder": ["base64-encoder", "url-encoder", "json-formatter"],
  "regex-tester": ["json-validator", "text-diff", "text-case-converter"],
  
  // Text tools relationships
  "word-counter": ["text-case-converter", "reading-time", "duplicate-line-remover", "slug-generator"],
  "text-case-converter": ["word-counter", "duplicate-line-remover", "slug-generator"],
  "reading-time": ["word-counter", "text-diff"],
  "text-diff": ["word-counter", "reading-time", "text-case-converter"],
  "duplicate-line-remover": ["word-counter", "text-case-converter", "slug-generator"],
  "slug-generator": ["word-counter", "text-case-converter", "duplicate-line-remover"],
  
  // Calculator relationships
  "percentage-calculator": ["discount-calculator", "tip-calculator", "simple-interest", "compound-interest"],
  "discount-calculator": ["percentage-calculator", "tip-calculator", "simple-interest"],
  "tip-calculator": ["percentage-calculator", "discount-calculator"],
  "simple-interest": ["percentage-calculator", "discount-calculator", "compound-interest"],
  "compound-interest": ["percentage-calculator", "simple-interest"],
  "bmi-calculator": ["age-calculator", "date-difference"],
  "age-calculator": ["bmi-calculator", "date-difference"],
  "date-difference": ["age-calculator", "bmi-calculator"],
  "unit-converter": ["percentage-calculator", "temperature-converter"],
  
  // Productivity relationships
  "pomodoro": ["reading-time", "word-counter"],
  "password-generator": ["uuid-generator", "random-number-generator"],
  "uuid-generator": ["password-generator", "random-number-generator"],
  "random-number-generator": ["password-generator", "uuid-generator"],
};

interface RelatedToolsProps {
  currentSlug: string;
  maxTools?: number;
}

export default function RelatedTools({ currentSlug, maxTools = 4 }: RelatedToolsProps) {
  // Get current tool
  const currentTool = TOOLS.find(t => t.slug === currentSlug);
  if (!currentTool) return null;

  // Get related tools from relationships
  const relatedFromRelationships = TOOL_RELATIONSHIPS[currentSlug] || [];
  
  // Get tools from same category
  const sameCategoryTools = getToolsByCategory(currentTool.category)
    .filter(t => t.slug !== currentSlug)
    .map(t => t.slug);

  // Get tools with similar tags
  const similarTagTools = TOOLS
    .filter(t => t.slug !== currentSlug && 
      t.tags.some(tag => currentTool.tags.includes(tag)))
    .map(t => t.slug);

  // Combine and deduplicate
  const allRelatedSlugs = [
    ...relatedFromRelationships,
    ...sameCategoryTools.slice(0, 2),
    ...similarTagTools.slice(0, 2)
  ];
  
  const uniqueRelatedSlugs = Array.from(new Set(allRelatedSlugs));
  
  // Get tool objects
  const relatedTools = uniqueRelatedSlugs
    .map(slug => TOOLS.find(t => t.slug === slug))
    .filter((tool): tool is typeof TOOLS[0] => tool !== undefined)
    .slice(0, maxTools);

  if (relatedTools.length === 0) return null;

  return (
    <section className="mt-8 border-t border-white/[0.05] pt-8" aria-label="Related tools">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-400">
        You may also need
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {relatedTools.map(tool => (
          <Link
            key={tool.slug}
            href={tool.href}
            className="card-hover group flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-indigo-400/25"
          >
            <div>
              <span className="block font-semibold text-white group-hover:text-indigo-200">{tool.name}</span>
              <span className="mt-1 block text-xs text-ink-500">{tool.summary}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-ink-600 transition-transform group-hover:translate-x-1 group-hover:text-indigo-400" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

// Utility to get related tools for a given tool
export function getRelatedToolSlugs(slug: string): string[] {
  const currentTool = TOOLS.find(t => t.slug === slug);
  if (!currentTool) return [];

  const relatedFromRelationships = TOOL_RELATIONSHIPS[slug] || [];
  const sameCategoryTools = getToolsByCategory(currentTool.category)
    .filter(t => t.slug !== slug)
    .map(t => t.slug);
  const similarTagTools = TOOLS
    .filter(t => t.slug !== slug && 
      t.tags.some(tag => currentTool.tags.includes(tag)))
    .map(t => t.slug);

  return Array.from(new Set([
    ...relatedFromRelationships,
    ...sameCategoryTools.slice(0, 2),
    ...similarTagTools.slice(0, 2)
  ]));
}
