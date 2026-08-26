/**
 * Hash generation, entirely on-device.
 *
 * SHA-1/256/384/512 come from the platform's WebCrypto implementation; MD5 is
 * a small self-contained RFC 1321 implementation (WebCrypto dropped MD5).
 * Nothing is sent anywhere — hash inputs never leave the page.
 */

export const HASH_ALGORITHMS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

export type HashResult = {
  algorithm: HashAlgorithm;
  hex: string;
  base64: string;
};

export function hexFromBytes(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

export function base64FromBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/** Hash a byte array with every supported algorithm. */
export async function hashAll(data: Uint8Array): Promise<HashResult[]> {
  const md5Hex = md5(data);
  const results: HashResult[] = [
    {
      algorithm: "MD5",
      hex: md5Hex,
      base64: base64FromBytes(
        Uint8Array.from(md5Hex.match(/.{2}/g)!.map((pair) => parseInt(pair, 16))),
      ),
    },
  ];

  const subtle = globalThis.crypto?.subtle;
  for (const algorithm of HASH_ALGORITHMS.slice(1)) {
    if (!subtle) throw new Error("WebCrypto is not available in this context.");
    // Inputs come from TextEncoder/arrayBuffer, both backed by an ArrayBuffer;
    // the cast satisfies the BufferSource constraint without copying.
    const bytes = new Uint8Array(await subtle.digest(algorithm, data as Uint8Array<ArrayBuffer>));
    results.push({ algorithm, hex: hexFromBytes(bytes), base64: base64FromBytes(bytes) });
  }
  return results;
}

/* ------------------------------------------------------------------ *
 * MD5 (RFC 1321), self-contained.
 * ------------------------------------------------------------------ */

// Per the RFC, K[i] = floor(abs(sin(i + 1)) × 2^32).
const MD5_K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32));
const MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

export function md5(data: Uint8Array): string {
  // Padding: 0x80, zeros until length ≡ 56 (mod 64), then the 64-bit
  // little-endian bit length. JS numbers are exact up to 2^53, which covers
  // every input this tool can accept.
  const bitLength = data.length * 8;
  const paddedLength = (((data.length + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  padded[data.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, bitLength, true);
  view.setUint32(paddedLength - 4, Math.floor(bitLength / 2 ** 32), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const rotateLeft = (value: number, amount: number) => (value << amount) | (value >>> (32 - amount));

  for (let offset = 0; offset < paddedLength; offset += 64) {
    const m: number[] = [];
    for (let i = 0; i < 16; i += 1) m.push(view.getUint32(offset + i * 4, true));

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i += 1) {
      let f: number;
      let g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      // Canonical round: compute from the old register values, then rotate
      // a ← d, d ← c, c ← b, b ← b + leftrotate(sum, s).
      const sum = (a + f + MD5_K[i] + m[g]) | 0;
      const nextB = (b + rotateLeft(sum, MD5_S[i])) | 0;
      a = d;
      d = c;
      c = b;
      b = nextB;
    }

    a0 = (a0 + a) | 0;
    b0 = (b0 + b) | 0;
    c0 = (c0 + c) | 0;
    d0 = (d0 + d) | 0;
  }

  const digest = new DataView(new ArrayBuffer(16));
  digest.setUint32(0, a0, true);
  digest.setUint32(4, b0, true);
  digest.setUint32(8, c0, true);
  digest.setUint32(12, d0, true);
  return hexFromBytes(new Uint8Array(digest.buffer));
}
