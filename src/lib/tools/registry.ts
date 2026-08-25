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
    kind: "text",
    slug: "base64-encoder",
    name: "Base64 Encoder/Decoder",
    summary: "Encode text as Base64 or decode Base64 back to text, with full Unicode support.",
    category: "developer",
    tags: ["base64", "encode", "decode", "text"],
    href: "/tools/base64-encoder",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      persistence: "none",
    },
  },
  {
    kind: "text",
    slug: "url-encoder",
    name: "URL Encoder/Decoder",
    summary: "Percent-encode text for URLs, or decode an encoded string back to plain text.",
    category: "developer",
    tags: ["url", "encode", "decode", "percent"],
    href: "/tools/url-encoder",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      persistence: "none",
    },
  },
  {
    kind: "text",
    slug: "uuid-generator",
    name: "UUID Generator",
    summary: "Generate random RFC 4122 version 4 UUIDs in bulk, with formatting options.",
    category: "developer",
    tags: ["uuid", "guid", "random", "id"],
    href: "/tools/uuid-generator",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      // Count and formatting options persist; generated values never do.
      persistence: "preferences",
    },
  },
  {
    kind: "text",
    slug: "jwt-decoder",
    name: "JWT Decoder",
    summary: "Inspect a JSON Web Token's header and payload with claim dates decoded. No verification.",
    category: "developer",
    tags: ["jwt", "token", "json", "debug"],
    href: "/tools/jwt-decoder",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      persistence: "none",
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
    kind: "text",
    slug: "text-case-converter",
    name: "Text Case Converter",
    summary: "Convert text between upper, lower, title, sentence, camel, snake and more.",
    category: "utilities",
    tags: ["text", "case", "writing", "format"],
    href: "/tools/text-case-converter",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      // The last-used style persists; the text never does.
      persistence: "preferences",
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
  {
    kind: "calculator",
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    summary: "Work out percentages of values, shares of a total, and percentage change.",
    category: "calculators",
    tags: ["percent", "math", "change"],
    href: "/tools/percentage-calculator",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      persistence: "none",
    },
  },
  {
    kind: "calculator",
    slug: "date-difference",
    name: "Date Difference Calculator",
    summary: "Measure the time between two dates in days, weeks, months and weekdays.",
    category: "calculators",
    tags: ["date", "time", "days"],
    href: "/tools/date-difference",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      persistence: "none",
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
