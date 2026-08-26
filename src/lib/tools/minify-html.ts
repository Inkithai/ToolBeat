/**
 * A conservative HTML minifier.
 *
 * - removes HTML comments (keeps `<!DOCTYPE …>`)
 * - normalizes whitespace inside tags (quote-aware, so attribute values survive)
 * - collapses runs of whitespace in text to a single space
 * - trims text whitespace at block-level / non-rendering element edges, and
 *   drops whitespace-only nodes between them
 * - leaves raw-text elements (`<script>`, `<style>`, `<textarea>`, `<pre>`,
 *   `<title>`) byte-for-byte untouched
 *
 * Whitespace between two inline elements is preserved (`a <b>b</b>` keeps its
 * space), so visible text is never changed. One known limitation, shared with
 * classic HTML minifiers: a `</script>`-like sequence inside a script string
 * will be treated as the end of the raw text.
 */

type Token =
  | { type: "tag"; name: string; closing: boolean; text: string }
  | { type: "text"; value: string }
  | { type: "raw"; value: string };

const RAW_TEXT_TAGS = new Set(["script", "style", "textarea", "pre", "title"]);
const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);
/** Elements whose text edges the browser discards or that render no text. */
const BLOCKY_TAGS = new Set([
  "address", "article", "aside", "base", "blockquote", "body", "br", "caption",
  "center", "dd", "details", "dialog", "div", "dl", "dt", "fieldset",
  "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6",
  "head", "header", "hr", "html", "li", "link", "main", "meta", "nav", "ol",
  "p", "script", "section", "style", "summary", "table", "tbody", "td",
  "tfoot", "th", "thead", "tr", "ul",
]);
const EDGE_TRIM_TAGS = new Set([...BLOCKY_TAGS, ...VOID_TAGS]);

function findTagEnd(html: string, from: number): number {
  let quote: string | null = null;
  for (let i = from; i < html.length; i++) {
    const ch = html[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ">") {
      return i;
    }
  }
  return -1;
}

/** Collapse whitespace in a tag, respecting quoted attribute values. */
function normalizeTag(raw: string): string {
  let out = "";
  let quote: string | null = null;
  let inWhitespace = false;
  for (const ch of raw) {
    if (quote) {
      out += ch;
      if (ch === quote) quote = null;
      inWhitespace = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      out += ch;
      quote = ch;
      inWhitespace = false;
      continue;
    }
    if (/\s/.test(ch)) {
      inWhitespace = true;
      continue;
    }
    if (inWhitespace) {
      // Drop whitespace adjacent to `<`, `>` or `/`, keep a single space otherwise.
      if (out[out.length - 1] === "<" || ch === ">" || ch === "/") {
        // no space
      } else {
        out += " ";
      }
      inWhitespace = false;
    }
    out += ch;
  }
  return out.trim();
}

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const n = html.length;
  let i = 0;
  while (i < n) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      tokens.push({ type: "text", value: html.slice(i) });
      break;
    }
    if (lt > i) tokens.push({ type: "text", value: html.slice(i, lt) });

    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt + 4);
      if (end === -1) {
        tokens.push({ type: "text", value: html.slice(lt) });
        break;
      }
      i = end + 3;
      continue;
    }
    if (html[lt + 1] === "!") {
      const end = html.indexOf(">", lt);
      if (end === -1) {
        tokens.push({ type: "text", value: html.slice(lt) });
        break;
      }
      tokens.push({ type: "tag", name: "", closing: false, text: normalizeTag(html.slice(lt, end + 1)) });
      i = end + 1;
      continue;
    }
    if (html[lt + 1] === "?") {
      const end = html.indexOf("?>", lt);
      if (end === -1) {
        tokens.push({ type: "text", value: html.slice(lt) });
        break;
      }
      i = end + 2;
      continue;
    }
    if (html[lt + 1] === "/") {
      const end = html.indexOf(">", lt);
      if (end === -1) {
        tokens.push({ type: "text", value: html.slice(lt) });
        break;
      }
      const name = html.slice(lt + 2, end).trim().toLowerCase();
      tokens.push({ type: "tag", name, closing: true, text: `</${name}>` });
      i = end + 1;
      continue;
    }
    const end = findTagEnd(html, lt + 2);
    if (end === -1) {
      tokens.push({ type: "text", value: html.slice(lt) });
      break;
    }
    const rawTag = html.slice(lt, end + 1);
    const nameMatch = rawTag.match(/^<\s*([a-zA-Z][a-zA-Z0-9-]*)/);
    const name = nameMatch ? nameMatch[1].toLowerCase() : "";
    tokens.push({ type: "tag", name, closing: false, text: normalizeTag(rawTag) });
    i = end + 1;

    if (name && RAW_TEXT_TAGS.has(name) && !/\/\s*>$/.test(rawTag)) {
      const closeRe = new RegExp(`</\\s*${name}\\s*>`, "i");
      const match = closeRe.exec(html.slice(i));
      if (match) {
        tokens.push({ type: "raw", value: html.slice(i, i + match.index) });
        tokens.push({ type: "tag", name, closing: true, text: `</${name}>` });
        i += match.index + match[0].length;
      } else {
        tokens.push({ type: "raw", value: html.slice(i) });
        i = n;
      }
    }
  }
  return tokens;
}

/**
 * Collapse whitespace. Trims at element edges the browser discards and removes
 * whitespace-only runs between block-level edges; single spaces between inline
 * elements survive.
 */
function collapseWhitespace(tokens: Token[]): string {
  const out: string[] = [];
  const stack: string[] = [];
  let prevName: string | null = null;

  const leftEdge = (): boolean => {
    if (stack.length > 0) return EDGE_TRIM_TAGS.has(stack[stack.length - 1]);
    return prevName !== null ? EDGE_TRIM_TAGS.has(prevName) : true; // document start
  };

  const rightEdge = (idx: number): boolean => {
    for (let k = idx + 1; k < tokens.length; k++) {
      const token = tokens[k];
      if (token.type === "tag") {
        return token.name ? EDGE_TRIM_TAGS.has(token.name) : true;
      }
      if (token.type === "raw") return false;
      if (token.type === "text" && /\S/.test(token.value)) return false;
    }
    return true; // document end
  };

  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx];
    if (token.type === "raw") {
      out.push(token.value);
      continue;
    }
    if (token.type === "tag") {
      out.push(token.text);
      if (token.name) {
        if (token.closing) {
          const pos = [...stack].reverse().findIndex((tag) => tag === token.name);
          if (pos !== -1) stack.length = stack.length - pos;
        } else if (!VOID_TAGS.has(token.name) && !RAW_TEXT_TAGS.has(token.name)) {
          stack.push(token.name);
        }
      }
      prevName = token.name || prevName;
      continue;
    }
    const leading = leftEdge();
    const trailing = rightEdge(idx);
    let value = token.value;
    value = leading ? value.replace(/^\s+/, " ") : value;
    value = trailing ? value.replace(/\s+$/, " ") : value;
    value = value.replace(/\s+/g, " ");
    if (value === " ") {
      // Whitespace-only node: drop at block edges, keep one space between inlines.
      if (!leading && !trailing) out.push(" ");
      continue;
    }
    if (value !== "") out.push(value);
  }
  return out.join("");
}

export function minifyHtml(html: string): string {
  return collapseWhitespace(tokenize(html));
}
