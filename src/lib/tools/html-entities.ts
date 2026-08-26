/**
 * HTML entity encoding and decoding, backed by `he` (imported dynamically —
 * the named-entity table is sizable, so it belongs in its own chunk).
 */

export type HtmlEntityOptions = {
  /** "special" escapes only & < > " ' ; "all" escapes every character. */
  level?: "special" | "all";
  /** Prefer named references (&amp;) over numeric (&#38;). */
  useNamedReferences?: boolean;
  /** Decimal numeric references instead of hex. */
  decimal?: boolean;
};

export async function encodeHtml(text: string, options: HtmlEntityOptions = {}): Promise<string> {
  const { default: he } = await import("he");
  // `level` is a real runtime option of he but is missing from @types/he.
  const heOptions = {
    level: options.level === "all" ? "all" : "html",
    useNamedReferences: options.useNamedReferences ?? false,
    decimal: options.decimal ?? false,
  } as Parameters<typeof he.encode>[1];
  return he.encode(text, heOptions);
}

export async function decodeHtml(text: string, isAttributeValue = false): Promise<string> {
  const { default: he } = await import("he");
  return he.decode(text, { isAttributeValue });
}
