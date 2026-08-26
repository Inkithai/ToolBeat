/**
 * URL parsing, query-string building and UTM tagging.
 *
 * Built on the WHATWG `URL`/`URLSearchParams` globals, which exist in both the
 * browser and Node — no network involved, purely string math.
 */

export type QueryPair = { key: string; value: string };

export type ParsedUrl = {
  input: string;
  valid: boolean;
  error?: string;
  href?: string;
  protocol?: string;
  host?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  params: QueryPair[];
};

export function parseUrl(input: string): ParsedUrl {
  const trimmed = input.trim();
  if (!trimmed) {
    return { input, valid: false, error: "Paste a URL first.", params: [] };
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
      return { input, valid: false, error: `The URL "${trimmed}" is malformed.`, params: [] };
    }
    return {
      input,
      valid: false,
      error: "This doesn't look like a URL — add a protocol such as https://.",
      params: [],
    };
  }
  const params: QueryPair[] = [];
  url.searchParams.forEach((value, key) => params.push({ key, value }));
  return {
    input,
    valid: true,
    href: url.href,
    protocol: url.protocol.replace(":", ""),
    host: url.host,
    hostname: url.hostname,
    port: url.port || undefined,
    pathname: url.pathname,
    search: url.search || undefined,
    hash: url.hash || undefined,
    params,
  };
}

export function buildQueryString(
  pairs: QueryPair[],
  options: { sort?: boolean; skipEmpty?: boolean } = {},
): string {
  const filtered = options.skipEmpty
    ? pairs.filter((pair) => pair.key.trim() !== "" && pair.value.trim() !== "")
    : pairs.filter((pair) => pair.key.trim() !== "");
  const list = options.sort ? [...filtered].sort((a, b) => a.key.localeCompare(b.key)) : filtered;
  // URLSearchParams uses form encoding (spaces as "+"); URL queries read more
  // naturally with %20, so normalise it.
  return new URLSearchParams(list.map((pair) => [pair.key, pair.value])).toString().replace(/\+/g, "%20");
}

export function parseQueryString(query: string): QueryPair[] {
  const trimmed = query.trim().replace(/^\?/, "");
  if (!trimmed) return [];
  const pairs: QueryPair[] = [];
  new URLSearchParams(trimmed).forEach((value, key) => pairs.push({ key, value }));
  return pairs;
}

export type UtmFields = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
};

export const UTM_KEYS: { key: string; label: string; field: keyof UtmFields }[] = [
  { key: "utm_source", label: "Source", field: "source" },
  { key: "utm_medium", label: "Medium", field: "medium" },
  { key: "utm_campaign", label: "Campaign", field: "campaign" },
  { key: "utm_term", label: "Term", field: "term" },
  { key: "utm_content", label: "Content", field: "content" },
];

export function buildUtm(
  url: string,
  utm: UtmFields,
  options: { replaceExisting?: boolean } = {},
): { valid: boolean; error?: string; href?: string; replaced: string[] } {
  const parsed = parseUrl(url);
  if (!parsed.valid) {
    return { valid: false, error: parsed.error, replaced: [] };
  }
  const target = new URL(url.trim());
  const replaced: string[] = [];
  for (const { key, field } of UTM_KEYS) {
    const value = utm[field];
    if (value === undefined || value.trim() === "") continue;
    if (options.replaceExisting !== false && target.searchParams.has(key)) {
      replaced.push(key);
    }
    target.searchParams.set(key, value.trim());
  }
  return { valid: true, href: target.href, replaced };
}

export function extractUtm(url: string): {
  valid: boolean;
  error?: string;
  params: { key: string; label: string; present: boolean; value: string }[];
} {
  const parsed = parseUrl(url);
  if (!parsed.valid) {
    return { valid: false, error: parsed.error, params: [] };
  }
  const target = new URL(url.trim());
  const params = UTM_KEYS.map(({ key, label }) => ({
    key,
    label,
    present: target.searchParams.has(key),
    value: target.searchParams.get(key) ?? "",
  }));
  return { valid: true, params };
}
