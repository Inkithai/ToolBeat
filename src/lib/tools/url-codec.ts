/**
 * URL percent-encoding, with the one decision that actually matters:
 * `component` encoding is for a single parameter value (spaces become %20,
 * `&`, `=`, `?` are all escaped), while `uri` encoding is for a complete URL
 * (separators survive). The tool exposes both because mixing them up is the
 * most common way this goes wrong.
 */

export type UrlEncodingMode = "component" | "uri";

export function encodeUrl(text: string, mode: UrlEncodingMode): string {
  return mode === "component" ? encodeURIComponent(text) : encodeURI(text);
}

export function decodeUrl(text: string, mode: UrlEncodingMode): string {
  try {
    return mode === "component" ? decodeURIComponent(text) : decodeURI(text);
  } catch {
    throw new Error("That is not a valid percent-encoded string. Check for stray % characters.");
  }
}
