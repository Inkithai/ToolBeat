import { CATEGORIES } from "@/constants/app";
import { isConversionTool, type ToolDefinition } from "./types";

/**
 * Directory search.
 *
 * The previous implementation was a single substring test against one
 * concatenated string, which meant "json csv" matched nothing (no tool's
 * corpus contains the literal substring "json csv") and every match ranked
 * equally. This module gives discovery token-based AND matching with
 * per-field weights, so a hit in a tool's name outranks a hit in its summary
 * while multi-word queries keep working like people expect.
 *
 * It is deliberately dependency-free: 30-odd tools do not need a fuzzy-search
 * library, and a plain scorer this size is easy to reason about and test.
 */

/** Search vocabulary for a single tool, normalized and weighted. */
type SearchField = { value: string; weight: number };

/**
 * A few common words people type that no field literally contains. Aliases
 * widen recall only — they never replace a direct match, and alias hits score
 * at the lowest weight so genuine name matches outrank them.
 */
const SEARCH_ALIASES: Record<string, readonly string[]> = {
  word: ["docx"],
  excel: ["csv"],
  picture: ["image"],
  photo: ["image"],
  // Stage 3/4 aliases for discoverability
  combine: ["merge", "join"],
  split: ["extract", "separate"],
  crop: ["trim", "cut"],
  eyedropper: ["color", "picker"],
  dimensions: ["size", "resolution", "width", "height"],
  types: ["interface", "struct", "class"],
  python: ["dataclass", "py"],
  golang: ["go"],
  csharp: ["c#", "dotnet", ".net"],
  cronjob: ["cron"],
  scheduler: ["cron"],
  status: ["http"],
  mimetype: ["mime", "content"],
  useragent: ["browser", "client"],
  home: ["mortgage", "loan"],
  profit: ["breakeven", "break"],
  income: ["tax", "salary"],
  paycheck: ["salary"],
  workdays: ["business", "days"],
  stopwatch: ["timer", "countdown", "clock"],
  timezone: ["meeting", "world", "clock"],
  compare: ["diff"],
  react: ["jsx"],
  pixels: ["px"],
  rem: ["em", "root"],
  cheat: ["cheatsheet", "reference"],
  keycode: ["keyboard", "event"],
  fuel: ["gas", "petrol", "trip"],
  baby: ["pregnancy", "due"],
  grades: ["gpa", "school"],
  words: ["number", "num2words"],
  storage: ["bytes", "gb", "tb", "mb"],
  typeface: ["font", "typography"],
  icon: ["favicon"],
  display: ["screen", "resolution", "breakpoint"],
  bits: ["binary"],
  when: ["date", "format"],
  entropy: ["password", "strength"],
  a11y: ["wcag", "contrast", "accessibility"],
  compress: ["minify", "json"],
  renderer: ["markdown", "html"],
  daltonize: ["color", "blindness"],
  sitemap: ["xml", "seo"],
  crawler: ["robots"],
  og: ["opengraph", "social", "facebook", "twitter"],
  schema: ["json", "draft"],
  integrity: ["sri", "cdn", "subresource"],
  head: ["meta"],
  signature: ["email", "html"],
  preflight: ["cors", "origin"],
  ssh: ["key", "ed25519", "ecdsa"],
  deterministic: ["uuid", "v5", "namespace"],
  certificate: ["x509", "ssl", "tls", "pem"],
  sqli: ["sql", "injection", "security"],
  palette: ["color", "extract", "dominant"],
  fake: ["mock", "api", "data"],
  container: ["docker", "compose"],
  npm: ["package", "node"],
  regex: ["regular", "expression", "pattern"],
  summarizer: ["summary", "tldr"],
  rewriter: ["rewrite", "tone"],
  describe: ["regex", "english"],
  query: ["sql", "database"],
};

/** Lowest weight — below every direct field hit. */
const ALIAS_WEIGHT = 1;

/** Bonus when the whole query is the tool's exact name. */
const EXACT_NAME_BONUS = 3;

export function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[\s._/\-]+/g, " ").trim();
}

export function tokenizeSearch(query: string): string[] {
  return normalizeSearchText(query)
    .split(" ")
    .filter((token) => token.length > 0);
}

function categoryLabel(key: string): string {
  return CATEGORIES.find((category) => category.key === key)?.label ?? key;
}

export function buildSearchFields(tool: ToolDefinition): SearchField[] {
  const fields: SearchField[] = [
    { value: tool.name, weight: 5 },
    { value: tool.slug, weight: 4 },
    { value: tool.tags.join(" "), weight: 3 },
    { value: `${tool.category} ${categoryLabel(tool.category)}`, weight: 2 },
    { value: tool.summary, weight: 1 },
  ];
  if (isConversionTool(tool)) {
    // Extensions are searchable so "jpeg" finds the JPG converters even
    // though none of them say "jpeg" in their name.
    fields.push({
      value: `${tool.conversion.fromFormat} ${tool.conversion.toFormat}`,
      weight: 4,
    });
    fields.push({
      value: tool.conversion.acceptedExtensions.join(" "),
      weight: 3,
    });
  }
  return fields.map((field) => ({
    value: normalizeSearchText(field.value),
    weight: field.weight,
  }));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Best score for one token against one tool, or 0 when the token matches
 * nothing. A token scores once even if it appears in several fields.
 */
function tokenScore(fields: readonly SearchField[], token: string): number {
  let best = 0;
  const wordBoundaryRegex = new RegExp(`\\b${escapeRegExp(token)}\\b`, "i");

  for (const field of fields) {
    if (field.value.includes(token)) {
      const isWordBoundary = wordBoundaryRegex.test(field.value);
      const score = field.weight + (isWordBoundary ? 2 : 0);
      if (score > best) {
        best = score;
      }
    }
  }
  if (best > 0) return best;

  for (const alias of SEARCH_ALIASES[token] ?? []) {
    for (const field of fields) {
      if (field.value.includes(alias)) return ALIAS_WEIGHT;
    }
  }
  return 0;
}

/**
 * Score a tool against a tokenized query. `null` means "does not match":
 * every token must hit something (AND semantics).
 */
export function scoreTool(tool: ToolDefinition, tokens: readonly string[]): number | null {
  if (tokens.length === 0) return 0;
  const fields = buildSearchFields(tool);
  let total = 0;
  for (const token of tokens) {
    const score = tokenScore(fields, token);
    if (score === 0) return null;
    total += score;
  }
  if (tokens.join(" ") === normalizeSearchText(tool.name)) total += EXACT_NAME_BONUS;
  return total;
}

/**
 * Filter and rank tools for a query. An empty query returns every tool in
 * registry order; otherwise results are ordered by score (descending), with
 * the tool name as a deterministic tiebreaker.
 */
export function searchTools<T extends ToolDefinition>(tools: readonly T[], query: string): T[] {
  const tokens = tokenizeSearch(query);
  if (tokens.length === 0) return [...tools];

  return tools
    .map((tool) => ({ tool, score: scoreTool(tool, tokens) }))
    .filter((entry): entry is { tool: T; score: number } => entry.score !== null)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .map((entry) => entry.tool);
}
