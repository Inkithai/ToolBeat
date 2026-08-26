/**
 * A conservative CSS minifier.
 *
 * Single-pass, string-aware scanner that:
 * - removes comments
 * - collapses whitespace to at most one meaningful space
 * - drops the trailing semicolon before `}`
 * - shortens `#aabbcc`/`#aabbccff` hex colors
 * - removes zero values with units (`0px` → `0`)
 * - removes empty rules (`selector {}`), including nested ones
 *
 * It never rewrites inside quoted strings, so `content: "a{b}` is untouched.
 * No selectors, properties or values are reordered or renamed — output that
 * parses before will parse the same way after.
 */

type StringRange = { start: number; end: number };

const UNIT = /^(vmin|vmax|deg|grad|turn|px|em|rem|vh|vw|pt|in|cm|mm|ex|ch)/;

function isHexDigit(ch: string | undefined): boolean {
  return ch !== undefined && /[0-9a-fA-F]/.test(ch);
}

function shortenHex(hex: string): string | null {
  const lower = hex.toLowerCase();
  if (lower.length === 6) {
    if (lower[0] === lower[1] && lower[2] === lower[3] && lower[4] === lower[5]) {
      return `#${lower[0]}${lower[2]}${lower[4]}`;
    }
    return null;
  }
  if (lower.length === 8) {
    if (lower[6] !== lower[7]) return null;
    if (lower[0] === lower[1] && lower[2] === lower[3] && lower[4] === lower[5]) {
      return `#${lower[0]}${lower[2]}${lower[4]}${lower[6]}`;
    }
    return null;
  }
  return null;
}

export function minifyCss(css: string): string {
  const out: string[] = [];
  const stringRanges: StringRange[] = [];
  // For each open `{`: the output index where its selector/body text began.
  const ruleStack: { braceIndex: number; ruleStart: number }[] = [];

  const inStringAt = (index: number): boolean =>
    stringRanges.some((range) => index >= range.start && index < range.end);

  let i = 0;
  let quote: string | null = null;

  while (i < css.length) {
    const ch = css[i];
    const next = css[i + 1];

    if (quote) {
      out.push(ch);
      if (ch === "\\" && next !== undefined) {
        out.push(next);
        i += 2;
        continue;
      }
      if (ch === quote) {
        stringRanges[stringRanges.length - 1].end = out.length;
        quote = null;
      }
      i++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      stringRanges.push({ start: out.length, end: 0 });
      quote = ch;
      out.push(ch);
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      const close = css.indexOf("*/", i + 2);
      if (close === -1) throw new Error("The CSS has an unterminated comment.");
      i = close + 2;
      continue;
    }

    if (/\s/.test(ch)) {
      let j = i;
      while (j < css.length && /\s/.test(css[j])) j++;
      const prev = out[out.length - 1] ?? "";
      const after = css[j] ?? "";
      // A space is only meaningful between two visible characters, and never
      // next to structural characters where it cannot change meaning.
      if (prev && after && !"[{}([,:;".includes(prev) && !"]}];:,{(".includes(after)) {
        out.push(" ");
      }
      i = j;
      continue;
    }

    if (ch === "#") {
      const run = css.slice(i + 1, i + 9).match(/^[0-9a-fA-F]{3,8}/)?.[0] ?? "";
      if ((run.length === 6 || run.length === 8) && !isHexDigit(css[i + 1 + run.length])) {
        const shortened = shortenHex(run);
        if (shortened) {
          out.push(shortened);
          i += 1 + run.length;
          continue;
        }
      }
      out.push(ch);
      i++;
      continue;
    }

    if (ch === "0" && next !== undefined) {
      const unitMatch = css.slice(i + 1, i + 5).match(UNIT);
      const prevChar = out[out.length - 1] ?? "";
      if (
        unitMatch &&
        !/[0-9.]/.test(prevChar) &&
        !/[a-zA-Z0-9-]/.test(css[i + 1 + unitMatch[0].length] ?? "")
      ) {
        out.push("0");
        i += 1 + unitMatch[0].length;
        continue;
      }
    }

    if (ch === ";") {
      const prev = out[out.length - 1] ?? "";
      if (prev === "" || prev === ";" || prev === "{") {
        i++;
        continue;
      }
      out.push(ch);
      i++;
      continue;
    }

    if (ch === "{") {
      // Where does the selector (or nested content) for this rule begin?
      // Walk back to the previous structural boundary, skipping strings.
      let ruleStart = 0;
      for (let k = out.length - 1; k >= 0; k--) {
        if (inStringAt(k)) continue;
        const c = out[k];
        if (c === "}" || c === ";" || c === "{") {
          ruleStart = k + 1;
          break;
        }
      }
      ruleStack.push({ braceIndex: out.length, ruleStart });
      out.push("{");
      i++;
      continue;
    }

    if (ch === "}") {
      if (out[out.length - 1] === ";") out.pop();
      const frame = ruleStack.pop();
      if (frame && out.length === frame.braceIndex + 1) {
        // The rule body is empty — drop "selector {}" entirely. Deletion is at
        // the end of the output, so any string range starting inside the
        // deleted span is removed wholesale; ranges before it are untouched.
        let start = frame.ruleStart;
        const range = stringRanges.find((r) => start >= r.start && start < r.end);
        if (range) start = range.end;
        out.length = start;
        for (let k = stringRanges.length - 1; k >= 0; k--) {
          if (stringRanges[k].start >= start) stringRanges.splice(k, 1);
        }
        i++;
        continue;
      }
      out.push("}");
      i++;
      continue;
    }

    out.push(ch);
    i++;
  }

  if (quote) throw new Error("The CSS has an unterminated string.");

  return out.join("").replace(/\s+$/, "");
}
