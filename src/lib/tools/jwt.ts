import { decodeBase64UrlUtf8 } from "./base64";

/**
 * JWT *decoder* — this is a reading tool. It never verifies signatures; the
 * UI says so, and stating it here keeps that claim next to the code that
 * would have to change if it ever stopped being true.
 */

export type DecodedJwt = {
  header: unknown;
  payload: unknown;
  /** True when the token carries a third, signature segment. */
  hasSignature: boolean;
  /** Standard numeric date claims, in seconds since the epoch, when present. */
  issuedAt: number | null;
  notBefore: number | null;
  expiresAt: number | null;
  /** `false` once `now` is past `exp`; `null` when there is no `exp`. */
  isExpired: boolean | null;
};

function parseSegment(segment: string, what: string): unknown {
  let json: string;
  try {
    json = decodeBase64UrlUtf8(segment);
  } catch {
    throw new Error(`The ${what} is not valid Base64URL.`);
  }
  try {
    return JSON.parse(json);
  } catch {
    throw new Error(`The ${what} decoded but is not valid JSON.`);
  }
}

function numericClaim(payload: unknown, claim: string): number | null {
  if (typeof payload !== "object" || payload === null) return null;
  const value = (payload as Record<string, unknown>)[claim];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function decodeJwt(token: string, now: number = Date.now()): DecodedJwt {
  const segments = token.trim().split(".");
  if (segments.length < 2 || segments.length > 3 || segments[0] === "" || segments[1] === "") {
    throw new Error("A JWT is two or three Base64URL segments separated by dots.");
  }
  if (segments.length === 3 && segments[2] === "") {
    throw new Error("This token ends with a dot but has no signature segment.");
  }

  const header = parseSegment(segments[0], "header");
  const payload = parseSegment(segments[1], "payload");
  const expiresAt = numericClaim(payload, "exp");

  return {
    header,
    payload,
    hasSignature: segments.length === 3,
    issuedAt: numericClaim(payload, "iat"),
    notBefore: numericClaim(payload, "nbf"),
    expiresAt,
    isExpired: expiresAt === null ? null : now >= expiresAt * 1000,
  };
}

/** Formats a seconds-since-epoch claim for display; null stays null. */
export function claimToDate(claim: number | null): Date | null {
  return claim === null ? null : new Date(claim * 1000);
}
