import { describe, expect, it } from "vitest";
import { generateUuidV4, generateUuidV4List, looksLikeUuid } from "./uuid";

/** Deterministic byte source: 0,1,2,… — injected instead of mocking crypto. */
const sequential = (bytes: Uint8Array) => {
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = index;
  return bytes;
};

describe("generateUuidV4", () => {
  it("sets the version 4 and variant bits at the documented positions", () => {
    // Bytes 6 and 8 are 0x06 and 0x08 from the sequential source; after the
    // masked ORs they must become 0x46 and 0x88.
    expect(generateUuidV4(sequential)).toBe("00010203-0405-4607-8809-0a0b0c0d0e0f");
  });

  it("matches the v4 shape with the real crypto source", () => {
    const uuid = generateUuidV4();
    expect(looksLikeUuid(uuid)).toBe(true);
    expect(generateUuidV4()).not.toBe(uuid);
  });
});

describe("generateUuidV4List", () => {
  it("applies formatting options", () => {
    const [plain, upper, noHyphens] = [
      generateUuidV4List(1, { uppercase: false, hyphens: true })[0],
      generateUuidV4List(1, { uppercase: true, hyphens: true })[0],
      generateUuidV4List(1, { uppercase: false, hyphens: false })[0],
    ];
    expect(looksLikeUuid(plain)).toBe(true);
    expect(upper).toBe(upper.toUpperCase());
    expect(noHyphens).not.toContain("-");
    expect(noHyphens).toHaveLength(32);
  });

  it("generates the requested count, all unique", () => {
    const list = generateUuidV4List(50, { uppercase: false, hyphens: true });
    expect(list).toHaveLength(50);
    expect(new Set(list).size).toBe(50);
  });
});
