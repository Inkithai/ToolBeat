/**
 * Unicode escape/unescape and a small code-point inspector. Pure string math.
 */

export function escapeUnicode(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const ch = text[i];
    if (code >= 0x20 && code <= 0x7e && ch !== "\\" && ch !== '"') {
      out += ch;
      continue;
    }
    out += `\\u${code.toString(16).toUpperCase().padStart(4, "0")}`;
  }
  return out;
}

const NAMED_ESCAPES: Record<string, string> = {
  n: "\n",
  t: "\t",
  r: "\r",
  v: "\v",
  f: "\f",
  "0": "\0",
  "\\": "\\",
  "'": "'",
  '"': '"',
};

export function unescapeUnicode(text: string): string {
  return text.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[ntrvf0'\"\\])/g, (match, group: string) => {
    if (group.startsWith("u")) {
      return String.fromCharCode(Number.parseInt(group.slice(1), 16));
    }
    if (group.startsWith("x")) {
      return String.fromCharCode(Number.parseInt(group.slice(1), 16));
    }
    return NAMED_ESCAPES[group] ?? match;
  });
}

export type CharInfo = {
  char: string;
  /** Code point as U+XXXX. */
  codePoint: string;
  utf8Bytes: number;
  isAscii: boolean;
};

function utf8ByteLength(codePoint: number): number {
  if (codePoint < 0x80) return 1;
  if (codePoint < 0x800) return 2;
  if (codePoint < 0x10000) return 3;
  return 4;
}

/** Unique characters of the input, in order of first appearance. */
export function inspectUnicode(text: string): CharInfo[] {
  const seen = new Set<string>();
  const results: CharInfo[] = [];
  for (const char of text) {
    if (seen.has(char)) continue;
    seen.add(char);
    const codePoint = char.codePointAt(0) ?? 0;
    results.push({
      char,
      codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
      utf8Bytes: utf8ByteLength(codePoint),
      isAscii: codePoint < 0x80,
    });
  }
  return results;
}
