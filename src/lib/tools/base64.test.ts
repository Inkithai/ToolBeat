/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import {
  decodeBase64UrlUtf8,
  decodeBase64Utf8,
  encodeBase64UrlUtf8,
  encodeBase64Utf8,
} from "./base64";

describe("encodeBase64Utf8", () => {
  it("encodes ASCII exactly like the textbook examples", () => {
    expect(encodeBase64Utf8("hello")).toBe("aGVsbG8=");
    expect(encodeBase64Utf8("")).toBe("");
  });

  it("round-trips non-Latin-1 text, where raw btoa throws", () => {
    const text = "héllo — 😀 世界";
    expect(() => btoa(text)).toThrow();
    expect(decodeBase64Utf8(encodeBase64Utf8(text))).toBe(text);
  });
});

describe("decodeBase64Utf8", () => {
  it("decodes standard Base64", () => {
    expect(decodeBase64Utf8("aGVsbG8gd29ybGQ=")).toBe("hello world");
  });

  it("tolerates wrapped input with whitespace", () => {
    expect(decodeBase64Utf8("aGVs\nbG8=  ")).toBe("hello");
  });

  it("throws a readable error instead of the browser's InvalidCharacterError", () => {
    expect(() => decodeBase64Utf8("not*base64!")).toThrow(/not valid Base64/);
  });
});

describe("base64url variants", () => {
  it("uses the URL-safe alphabet without padding", () => {
    // "ÿÿ" encodes to standard Base64 containing "/" (and padded); the
    // URL-safe variant must not.
    const standard = encodeBase64Utf8("ÿÿ");
    expect(standard).toBe("w7/Dvw==");
    const urlSafe = encodeBase64UrlUtf8("ÿÿ");
    expect(urlSafe).toMatch(/^[-_A-Za-z0-9]+$/);
    expect(urlSafe).not.toMatch(/[+/=]/);
  });

  it("round-trips", () => {
    const text = '{"sub":"user/42?x=1&y=2"}';
    expect(decodeBase64UrlUtf8(encodeBase64UrlUtf8(text))).toBe(text);
  });
});
