import { describe, expect, it } from "vitest";
import { encodeBase64UrlUtf8 } from "./base64";
import { claimToDate, decodeJwt } from "./jwt";

const segment = (value: unknown) => encodeBase64UrlUtf8(JSON.stringify(value));

const makeToken = (header: unknown, payload: unknown, signed = true) =>
  [segment(header), segment(payload), ...(signed ? ["c2lnbmF0dXJl"] : [])].join(".");

const NOW = Date.UTC(2026, 0, 15, 12, 0, 0); // 2026-01-15T12:00:00Z
const nowSeconds = NOW / 1000;

describe("decodeJwt", () => {
  it("decodes header and payload and reports the signature", () => {
    const decoded = decodeJwt(
      makeToken({ alg: "HS256", typ: "JWT" }, { sub: "abc", iat: nowSeconds - 3600, exp: nowSeconds + 3600 }),
      NOW,
    );
    expect(decoded.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(decoded.payload).toEqual({ sub: "abc", iat: nowSeconds - 3600, exp: nowSeconds + 3600 });
    expect(decoded.hasSignature).toBe(true);
    expect(decoded.isExpired).toBe(false);
  });

  it("detects expired tokens against the supplied clock", () => {
    const decoded = decodeJwt(makeToken({}, { exp: nowSeconds - 1 }), NOW);
    expect(decoded.isExpired).toBe(true);
  });

  it("treats a missing exp as unknown rather than valid", () => {
    const decoded = decodeJwt(makeToken({}, { sub: "x" }), NOW);
    expect(decoded.expiresAt).toBeNull();
    expect(decoded.isExpired).toBeNull();
  });

  it("ignores non-numeric date claims", () => {
    const decoded = decodeJwt(makeToken({}, { exp: "tomorrow" }), NOW);
    expect(decoded.expiresAt).toBeNull();
  });

  it("accepts unsigned tokens but flags them", () => {
    const decoded = decodeJwt(makeToken({ alg: "none" }, {}, false), NOW);
    expect(decoded.hasSignature).toBe(false);
  });

  it("rejects structurally broken input with readable errors", () => {
    expect(() => decodeJwt("onlyonepart")).toThrow(/two or three/);
    expect(() => decodeJwt("a.b.")).toThrow(/no signature/);
    expect(() => decodeJwt(`!!.${segment({})}`)).toThrow(/header is not valid Base64URL/);
    expect(() => decodeJwt(`${segment({})}.%%%`)).toThrow(/payload is not valid Base64URL/);
    // Valid Base64URL but not JSON.
    expect(() => decodeJwt(`${encodeBase64UrlUtf8("not json")}.${segment({})}`)).toThrow(
      /not valid JSON/,
    );
  });
});

describe("claimToDate", () => {
  it("converts seconds to a Date and keeps null as null", () => {
    expect(claimToDate(0)).toEqual(new Date(0));
    expect(claimToDate(null)).toBeNull();
  });
});
