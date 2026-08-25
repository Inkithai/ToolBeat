/**
 * Base64 for text, Unicode-safe.
 *
 * The classic `btoa(str)` fails on any character outside Latin-1, which makes
 * it wrong for exactly the text people paste (emoji, CJK, curly quotes). These
 * helpers go through UTF-8 bytes so every string round-trips.
 */

export function encodeBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function decodeBase64Utf8(value: string): string {
  // Wrapped or line-broken Base64 (as found in PEM files and data URLs)
  // decodes fine once the whitespace is gone.
  const compact = value.replace(/\s+/g, "");
  try {
    const binary = atob(compact);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error("That is not valid Base64. Check for stray characters or truncation.");
  }
}

/** URL-safe Base64 (RFC 4648 §5): `-`/`_` alphabet, no padding — as used by JWTs. */
export function encodeBase64UrlUtf8(text: string): string {
  return encodeBase64Utf8(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBase64UrlUtf8(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return decodeBase64Utf8(padded);
}
