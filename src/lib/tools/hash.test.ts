import { describe, expect, it } from "vitest";
import { HASH_ALGORITHMS, base64FromBytes, hashAll, hexFromBytes, md5 } from "./hash";

const toBytes = (value: string) => new TextEncoder().encode(value);

describe("md5 (RFC 1321 vectors)", () => {
  it("hashes the empty string", () => {
    expect(md5(toBytes(""))).toBe("d41d8cd98f00b204e9800998ecf8427e");
  });
  it("hashes 'abc'", () => {
    expect(md5(toBytes("abc"))).toBe("900150983cd24fb0d6963f7d28e17f72");
  });
  it("hashes 'The quick brown fox jumps over the lazy dog'", () => {
    expect(md5(toBytes("The quick brown fox jumps over the lazy dog"))).toBe(
      "9e107d9d372bb6826bd81d3542a419d6",
    );
  });
  it("hashes multi-block input (> 64 bytes)", () => {
    // Cross-checked against Node crypto.createHash("md5").
    expect(md5(toBytes("a".repeat(200)))).toBe("887f30b43b2867f4a9accceee7d16e6c");
  });
});

describe("hex/base64 helpers", () => {
  it("hex-encodes bytes", () => {
    expect(hexFromBytes(new Uint8Array([0, 15, 255]))).toBe("000fff");
  });
  it("base64-encodes bytes", () => {
    expect(base64FromBytes(toBytes("abc"))).toBe("YWJj");
  });
});

describe("hashAll", () => {
  it("produces a row for every algorithm with hex and base64", async () => {
    const results = await hashAll(toBytes("hello"));
    expect(results.map((row) => row.algorithm)).toEqual([...HASH_ALGORITHMS]);
    for (const row of results) {
      expect(row.hex).toMatch(/^[0-9a-f]+$/);
      expect(row.base64.length).toBeGreaterThan(0);
    }
  });

  it("matches known SHA digests for 'abc'", async () => {
    const results = await hashAll(toBytes("abc"));
    const byName = new Map(results.map((row) => [row.algorithm, row.hex]));
    expect(byName.get("SHA-1")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
    expect(byName.get("SHA-256")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});
