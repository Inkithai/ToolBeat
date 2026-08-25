/**
 * Text case conversion.
 *
 * The interesting part is word splitting: "loadPDFReport-v2 final" has words
 * separated by punctuation, camelCase boundaries and an acronym boundary
 * (XMLParser → XML Parser). Everything else is joining.
 */

export type CaseStyle =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant";

export const CASE_STYLES: readonly { id: CaseStyle; label: string }[] = [
  { id: "upper", label: "UPPER CASE" },
  { id: "lower", label: "lower case" },
  { id: "title", label: "Title Case" },
  { id: "sentence", label: "Sentence case" },
  { id: "camel", label: "camelCase" },
  { id: "pascal", label: "PascalCase" },
  { id: "snake", label: "snake_case" },
  { id: "kebab", label: "kebab-case" },
  { id: "constant", label: "CONSTANT_CASE" },
];

export function splitWords(text: string): string[] {
  const spaced = text
    // lowercase followed by uppercase: "camelCase" → "camel Case"
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    // acronym followed by word: "XMLParser" → "XML Parser"
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  return spaced.split(/[^A-Za-z0-9]+/).filter(Boolean);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function capitalizeSentences(text: string): string {
  // Split keeping the ". " glue so rejoined text keeps its spacing.
  const parts = text.split(/([.!?]+\s+)/);
  return parts
    .map((part, index) => {
      if (index % 2 === 1) return part;
      const firstLetter = part.search(/[A-Za-z]/);
      if (firstLetter === -1) return part;
      return (
        part.slice(0, firstLetter) +
        part.charAt(firstLetter).toUpperCase() +
        part.slice(firstLetter + 1).toLowerCase()
      );
    })
    .join("");
}

export function convertCase(text: string, style: CaseStyle): string {
  switch (style) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return splitWords(text).map(capitalize).join(" ");
    case "sentence":
      return capitalizeSentences(text.toLowerCase());
    case "camel":
      return splitWords(text)
        .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
        .join("");
    case "pascal":
      return splitWords(text).map(capitalize).join("");
    case "snake":
      return splitWords(text).map((word) => word.toLowerCase()).join("_");
    case "kebab":
      return splitWords(text).map((word) => word.toLowerCase()).join("-");
    case "constant":
      return splitWords(text).map((word) => word.toUpperCase()).join("_");
  }
}
