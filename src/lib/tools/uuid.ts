/**
 * RFC 4122 version 4 UUIDs from `crypto.getRandomValues`, with the randomness
 * injected so tests can be exact without mocking globals.
 */

type RandomBytes = (bytes: Uint8Array) => Uint8Array;

function defaultRandom(bytes: Uint8Array): Uint8Array {
  return crypto.getRandomValues(bytes);
}

export function generateUuidV4(random: RandomBytes = defaultRandom): string {
  const bytes = random(new Uint8Array(16));
  // Version 4 and RFC 4122 variant bits — the only structure a v4 UUID has.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function generateUuidV4List(
  count: number,
  options: { uppercase: boolean; hyphens: boolean },
  random: RandomBytes = defaultRandom,
): string[] {
  const list: string[] = [];
  for (let index = 0; index < count; index += 1) {
    let uuid = generateUuidV4(random);
    if (!options.hyphens) uuid = uuid.replace(/-/g, "");
    if (options.uppercase) uuid = uuid.toUpperCase();
    list.push(uuid);
  }
  return list;
}

/** Loose shape check for display/validation purposes. */
export function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
