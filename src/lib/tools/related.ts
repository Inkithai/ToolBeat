import { TOOLS, getToolsByCategory } from "./registry";

const TOOL_RELATIONSHIPS: Record<string, string[]> = {
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
  "word-counter": ["text-case-converter", "reading-time", "duplicate-line-remover", "slug-generator"],
  "text-case-converter": ["word-counter", "duplicate-line-remover", "slug-generator"],
  "reading-time": ["word-counter", "text-diff"],
  "text-diff": ["word-counter", "reading-time", "text-case-converter"],
  "duplicate-line-remover": ["word-counter", "text-case-converter", "slug-generator"],
  "slug-generator": ["word-counter", "text-case-converter", "duplicate-line-remover"],
  "percentage-calculator": ["discount-calculator", "tip-calculator", "simple-interest", "compound-interest"],
  "discount-calculator": ["percentage-calculator", "tip-calculator", "simple-interest"],
  "tip-calculator": ["percentage-calculator", "discount-calculator"],
  "simple-interest": ["percentage-calculator", "discount-calculator", "compound-interest"],
  "compound-interest": ["percentage-calculator", "simple-interest"],
  "bmi-calculator": ["age-calculator", "date-difference"],
  "age-calculator": ["bmi-calculator", "date-difference"],
  "date-difference": ["age-calculator", "bmi-calculator"],
  "unit-converter": ["percentage-calculator"],
  pomodoro: ["reading-time", "word-counter"],
  "password-generator": ["uuid-generator", "random-number-generator"],
  "uuid-generator": ["password-generator", "random-number-generator"],
  "random-number-generator": ["password-generator", "uuid-generator"],
};

export function getRelatedToolSlugs(slug: string): string[] {
  const currentTool = TOOLS.find((tool) => tool.slug === slug);
  if (!currentTool) return [];

  const relatedFromRelationships = TOOL_RELATIONSHIPS[slug] || [];
  const sameCategoryTools = getToolsByCategory(currentTool.category)
    .filter((tool) => tool.slug !== slug)
    .map((tool) => tool.slug);
  const similarTagTools = TOOLS.filter(
    (tool) => tool.slug !== slug && tool.tags.some((tag) => currentTool.tags.includes(tag)),
  ).map((tool) => tool.slug);

  return Array.from(
    new Set([...relatedFromRelationships, ...sameCategoryTools.slice(0, 2), ...similarTagTools.slice(0, 2)]),
  );
}
