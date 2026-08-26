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
  { kind: "text", slug: "json-to-yaml-text", name: "JSON to YAML Text", summary: "Convert JSON text into readable YAML directly in your browser.", category: "developer", tags: ["json", "yaml", "convert"], href: "/tools/json-to-yaml", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },
  { kind: "text", slug: "yaml-to-json-text", name: "YAML to JSON Text", summary: "Convert YAML text into formatted JSON locally.", category: "developer", tags: ["yaml", "json", "convert"], href: "/tools/yaml-to-json", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },
  { kind: "text", slug: "xml-formatter", name: "XML Formatter", summary: "Format XML with consistent indentation and readable structure.", category: "developer", tags: ["xml", "format", "code"], href: "/tools/xml-formatter", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },
  { kind: "calculator", slug: "bmi-calculator", name: "BMI Calculator", summary: "Calculate body mass index from height and weight.", category: "calculators", tags: ["bmi", "health", "math"], href: "/tools/bmi-calculator", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },
  { kind: "calculator", slug: "compound-interest", name: "Compound Interest Calculator", summary: "Estimate growth with principal, rate, time, and compounding frequency.", category: "calculators", tags: ["interest", "finance", "savings"], href: "/tools/compound-interest", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },
  { kind: "text", slug: "json-validator", name: "JSON Validator", summary: "Check JSON syntax and get a clear validation result instantly.", category: "developer", tags: ["json", "validate", "debug"], href: "/tools/json-validator", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },
  { kind: "text", slug: "regex-tester", name: "Regex Tester", summary: "Test regular expressions against sample text with match details.", category: "developer", tags: ["regex", "text", "debug"], href: "/tools/regex-tester", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },
  { kind: "text", slug: "text-diff", name: "Text Diff", summary: "Compare two pieces of text and quickly spot what changed.", category: "utilities", tags: ["text", "compare", "diff"], href: "/tools/text-diff", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },
  { kind: "calculator", slug: "age-calculator", name: "Age Calculator", summary: "Calculate an exact age from a date of birth.", category: "calculators", tags: ["age", "date", "time"], href: "/tools/age-calculator", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },
  { kind: "calculator", slug: "simple-interest", name: "Simple Interest Calculator", summary: "Calculate simple interest and the total amount from principal, rate, and time.", category: "calculators", tags: ["interest", "finance", "math"], href: "/tools/simple-interest", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },

  { kind: "calculator", slug: "random-number-generator", name: "Random Number Generator", summary: "Generate a random number between any minimum and maximum value.", category: "calculators", tags: ["random", "number", "math"], href: "/tools/random-number-generator", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },
  { kind: "calculator", slug: "discount-calculator", name: "Discount Calculator", summary: "Calculate sale prices, savings, and final totals from a discount percentage.", category: "calculators", tags: ["discount", "percent", "money"], href: "/tools/discount-calculator", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },
  { kind: "calculator", slug: "tip-calculator", name: "Tip Calculator", summary: "Split a bill and calculate a fair tip for any group size.", category: "calculators", tags: ["tip", "bill", "money"], href: "/tools/tip-calculator", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" } },

  {
    kind: "text", slug: "slug-generator", name: "Slug Generator", summary: "Turn titles and phrases into clean, URL-friendly slugs.", category: "utilities", tags: ["text", "url", "seo"], href: "/tools/slug-generator", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "text", slug: "duplicate-line-remover", name: "Duplicate Line Remover", summary: "Remove repeated lines and clean up lists instantly in your browser.", category: "utilities", tags: ["text", "clean", "list"], href: "/tools/duplicate-line-remover", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "calculator", slug: "password-generator", name: "Password Generator", summary: "Create strong random passwords locally with configurable length and character sets.", category: "developer", tags: ["password", "security", "random"], href: "/tools/password-generator", capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
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
  {
    kind: "calculator",
    slug: "unit-converter",
    name: "Unit Converter",
    summary: "Convert length, mass, temperature, volume, time and digital storage units instantly.",
    category: "calculators",
    tags: ["units", "convert", "length", "temperature", "math"],
    href: "/tools/unit-converter",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      persistence: "none",
    },
  },
  {
    kind: "calculator",
    slug: "reading-time",
    name: "Reading Time Calculator",
    summary: "Estimate how long text takes to read or speak, with adjustable reading pace.",
    category: "utilities",
    tags: ["text", "reading", "writing", "time"],
    href: "/tools/reading-time",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      persistence: "none",
    },
  },
  {
    kind: "text",
    slug: "sql-formatter",
    name: "SQL Formatter",
    summary: "Format SQL queries for any major dialect with clean indentation and optional uppercase keywords.",
    category: "developer",
    tags: ["sql", "format", "code", "database"],
    href: "/tools/sql-formatter",
    capabilities: {
      processing: "on-device",
      requiresNetwork: false,
      // Dialect and style choices persist; query text never does.
      persistence: "preferences",
    },
  },
  {
    kind: "text",
    slug: "html-formatter",
    name: "HTML Formatter",
    summary: "Pretty-print HTML with consistent indentation, right in your browser.",
    category: "developer",
    tags: ["html", "format", "code"],
    href: "/tools/html-formatter",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "text",
    slug: "css-formatter",
    name: "CSS Formatter",
    summary: "Format CSS with readable indentation and one declaration per line.",
    category: "developer",
    tags: ["css", "format", "code"],
    href: "/tools/css-formatter",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "text",
    slug: "js-formatter",
    name: "JavaScript Formatter",
    summary: "Format JavaScript with consistent indentation, locally.",
    category: "developer",
    tags: ["javascript", "format", "code"],
    href: "/tools/js-formatter",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "text",
    slug: "json-to-typescript",
    name: "JSON to TypeScript",
    summary: "Generate TypeScript types from a JSON sample, with named types for nested objects.",
    category: "developer",
    tags: ["json", "typescript", "code", "generate"],
    href: "/tools/json-to-typescript",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "text",
    slug: "find-replace",
    name: "Find and Replace",
    summary: "Search and replace text with optional regex, capture groups, and a live match count.",
    category: "utilities",
    tags: ["text", "replace", "regex", "clean"],
    href: "/tools/find-replace",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "text",
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    summary: "Generate placeholder paragraphs, sentences or words for mockups and designs.",
    category: "utilities",
    tags: ["text", "writing", "filler", "generate"],
    href: "/tools/lorem-ipsum",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "calculator",
    slug: "hash-generator",
    name: "Hash Generator",
    summary: "Hash text or files with MD5, SHA-1, SHA-256, SHA-384 and SHA-512, entirely on-device.",
    category: "developer",
    tags: ["hash", "md5", "sha", "security", "encode"],
    href: "/tools/hash-generator",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none", maxFileSizeMb: 50 },
  },
  {
    kind: "calculator",
    slug: "qr-code-generator",
    name: "QR Code Generator",
    summary: "Create QR codes for any text with size, color and error-correction control, downloadable as PNG.",
    category: "developer",
    tags: ["qr", "code", "generate", "image"],
    href: "/tools/qr-code-generator",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "calculator",
    slug: "loan-calculator",
    name: "Loan / EMI Calculator",
    summary: "Compute monthly payments, total interest and a year-by-year amortization schedule.",
    category: "calculators",
    tags: ["loan", "emi", "interest", "finance", "mortgage"],
    href: "/tools/loan-calculator",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "text",
    slug: "color-converter",
    name: "Color Converter",
    summary: "Convert between HEX, RGB and HSL, with a live swatch and WCAG contrast ratios.",
    category: "developer",
    tags: ["color", "hex", "rgb", "hsl", "css", "design"],
    href: "/tools/color-converter",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "calculator",
    slug: "unix-timestamp",
    name: "Unix Timestamp Converter",
    summary: "Convert between Unix timestamps (seconds or milliseconds) and human-readable dates, both ways.",
    category: "calculators",
    tags: ["time", "unix", "timestamp", "date", "developer"],
    href: "/tools/unix-timestamp",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "timer",
    slug: "stopwatch",
    name: "Stopwatch",
    summary: "A fast, precise stopwatch with laps and splits, running entirely in your browser.",
    category: "utilities",
    tags: ["time", "stopwatch", "focus", "productivity"],
    href: "/tools/stopwatch",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none" },
  },
  {
    kind: "calculator",
    slug: "image-compressor",
    name: "Image Compressor",
    summary: "Compress PNG and JPG images with a quality slider, comparing before and after sizes.",
    category: "images",
    tags: ["image", "compress", "webp", "jpeg", "optimize"],
    href: "/tools/image-compressor",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none", maxFileSizeMb: 50 },
  },
  {
    kind: "calculator",
    slug: "image-resizer",
    name: "Image Resizer",
    summary: "Resize images to exact dimensions or a target box, with aspect ratio preserved by default.",
    category: "images",
    tags: ["image", "resize", "dimensions", "scale"],
    href: "/tools/image-resizer",
    capabilities: { processing: "on-device", requiresNetwork: false, persistence: "none", maxFileSizeMb: 50 },
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
