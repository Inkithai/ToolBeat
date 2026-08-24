import { CONVERSION_ENTRIES, FILE_LIMIT_MB } from "@/constants/app";
import type { ConversionTool, ToolDefinition } from "./types";

/**
 * The platform tool registry.
 *
 * Converters are *derived* from `CONVERSIONS` rather than re-declared, so the
 * existing catalog stays the single source of truth and the two can never
 * disagree. Non-converter tools are appended alongside them.
 */

/**
 * Format names map to stable lowercase tags. Only entries that need to differ
 * from `format.toLowerCase()` appear here.
 */
const FORMAT_TAG_OVERRIDES: Record<string, string> = {
  Text: "txt",
  "Markdown Table": "markdown",
};

function formatToTag(format: string): string {
  return FORMAT_TAG_OVERRIDES[format] ?? format.toLowerCase();
}

const conversionTools: ConversionTool[] = CONVERSION_ENTRIES.map(([type, conversion]) => ({
  kind: "file-conversion",
  slug: type,
  conversionType: type,
  name: `${conversion.fromFormat} to ${conversion.toFormat}`,
  summary: conversion.description,
  category: conversion.category,
  // Tags are derived so a new converter is taggable without a second edit.
  tags: Array.from(new Set([formatToTag(conversion.fromFormat), formatToTag(conversion.toFormat), "convert"])),
  href: `/conversion/${type}`,
  capabilities: {
    processing: "on-device",
    // Verified: no converter module performs a network request. Every heavy
    // dependency (jspdf, html2canvas, docx, mammoth) is bundled and imported
    // dynamically from the app itself.
    requiresNetwork: false,
    persistence: "none",
    maxFileSizeMb: FILE_LIMIT_MB,
  },
  conversion: {
    from: conversion.from,
    to: conversion.to,
    fromFormat: conversion.fromFormat,
    toFormat: conversion.toFormat,
    acceptedExtensions: conversion.acceptedExtensions,
    outputExtension: conversion.outputExtension,
  },
}));

/**
 * Tools that are not file conversions. These exist to prove the platform can
 * carry more than one interaction model; each declares its own capabilities.
 */
const utilityTools: ToolDefinition[] = [
  {
    kind: "text",
    slug: "json-formatter",
    name: "JSON Formatter",
    summary: "Format, validate and minify JSON without leaving the page.",
    category: "developer",
    tags: ["json", "format", "validate"],
    href: "/tools/json-formatter",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      // Indent width and sort-keys are preferences, not content.
      persistence: "preferences",
    },
  },
  {
    kind: "calculator",
    slug: "word-counter",
    name: "Word Counter",
    summary: "Count words, characters, sentences and estimated reading time as you type.",
    category: "utilities",
    tags: ["text", "writing", "count"],
    href: "/tools/word-counter",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      persistence: "none",
    },
  },
  {
    kind: "timer",
    slug: "pomodoro",
    name: "Pomodoro Timer",
    summary: "Work in focused intervals with automatic short and long breaks.",
    category: "utilities",
    tags: ["time", "focus", "productivity"],
    href: "/tools/pomodoro",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      // Interval lengths persist; nothing about session content is stored.
      persistence: "preferences",
    },
  },
];

export const TOOLS: readonly ToolDefinition[] = [...conversionTools, ...utilityTools];

const TOOLS_BY_SLUG = new Map(TOOLS.map((tool) => [tool.slug, tool]));

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS_BY_SLUG.get(slug);
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  return TOOLS.filter((tool) => tool.category === category);
}

/** All tags in use, sorted, for building filter UI without hard-coding a list. */
export function getAllTags(): string[] {
  return Array.from(new Set(TOOLS.flatMap((tool) => tool.tags))).sort();
}
