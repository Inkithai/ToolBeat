/**
 * IP address and CIDR analysis for IPv4 and IPv6. Pure math — no networking.
 *
 * IPv6 values are held as 128-bit BigInts; IPv4 as unsigned 32-bit numbers.
 */

export type Ipv4Analysis = {
  version: 4;
  address: string;
  prefix: number;
  network: string;
  broadcast: string;
  size: number;
  usable: number;
  firstUsable: string;
  lastUsable: string;
};

export type Ipv6Analysis = {
  version: 6;
  address: string;
  prefix: number;
  /** True when no /prefix was given and the default (64) was applied. */
  prefixWasDefaulted: boolean;
  network: string;
  firstAddress: string;
  lastAddress: string;
  /** The block holds 2^sizeExponent addresses. */
  sizeExponent: number;
  /** Exact decimal count when it is small, otherwise "2^n". */
  size: string;
};

export type IpAnalysis = Ipv4Analysis | Ipv6Analysis;

const IPV4_OCTET = /^\d{1,3}$/;
const IPV6_GROUP = /^[0-9a-f]{1,4}$/;

/** Parse a dotted-quad IPv4 address into an unsigned 32-bit integer. */
export function parseIpv4(address: string): number {
  const trimmed = address.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 4) {
    throw new Error(`IPv4 addresses need four dot-separated octets — "${trimmed}" has ${parts.length}.`);
  }
  let value = 0;
  for (const part of parts) {
    if (!IPV4_OCTET.test(part) || (part.length > 1 && part.startsWith("0"))) {
      throw new Error(`"${part}" is not a valid IPv4 octet.`);
    }
    const n = Number(part);
    if (n > 255) throw new Error(`IPv4 octet ${n} is out of range (0–255).`);
    value = value * 256 + n;
  }
  return value >>> 0;
}

export function ipv4ToString(value: number): string {
  return `${(value >>> 24) & 255}.${(value >>> 16) & 255}.${(value >>> 8) & 255}.${value & 255}`;
}

/**
 * Parse an IPv6 address (full or `::`-compressed) into a 128-bit BigInt.
 * IPv4-mapped tails such as `::ffff:1.2.3.4` are rejected.
 */
export function parseIpv6(address: string): bigint {
  const trimmed = address.trim().toLowerCase();
  if (trimmed.includes(".")) {
    throw new Error("IPv4-mapped addresses (e.g. ::ffff:1.2.3.4) are not supported — enter the full IPv6 form.");
  }
  const hasCompress = trimmed.includes("::");
  const headPart = hasCompress ? trimmed.slice(0, trimmed.indexOf("::")) : trimmed;
  const tailPart = hasCompress ? trimmed.slice(trimmed.indexOf("::") + 2) : "";
  const headGroups = headPart ? headPart.split(":") : [];
  const tailGroups = tailPart ? tailPart.split(":") : [];
  for (const group of [...headGroups, ...tailGroups]) {
    if (!IPV6_GROUP.test(group)) {
      throw new Error(`"${group || "(empty)"}" is not a valid IPv6 group (1–4 hex digits).`);
    }
  }
  const total = headGroups.length + tailGroups.length;
  if (!hasCompress) {
    if (total !== 8) throw new Error(`An IPv6 address without "::" needs exactly 8 groups — got ${total}.`);
  } else if (total > 7) {
    throw new Error(`"${address}" has too many groups left for a "::" compression.`);
  }
  const groups = [
    ...headGroups,
    ...Array(8 - total).fill("0"),
    ...tailGroups,
  ].map((group) => Number.parseInt(group, 16));
  let value = 0n;
  for (const group of groups) value = (value << 16n) | BigInt(group);
  return value;
}

/** Format a 128-bit value as a canonical compressed IPv6 string. */
export function ipv6ToString(value: bigint): string {
  const groups: number[] = [];
  for (let i = 7; i >= 0; i--) groups.push(Number((value >> BigInt(16 * i)) & 0xffffn));
  let bestStart = -1;
  let bestLen = 0;
  let runStart = -1;
  for (let i = 0; i < 8; i++) {
    if (groups[i] === 0) {
      if (runStart === -1) runStart = i;
      if (i - runStart + 1 > bestLen) {
        bestLen = i - runStart + 1;
        bestStart = runStart;
      }
    } else {
      runStart = -1;
    }
  }
  if (bestLen < 2) bestStart = -1;
  if (bestStart === -1) return groups.map((g) => g.toString(16)).join(":");
  const head = groups.slice(0, bestStart).map((g) => g.toString(16)).join(":");
  const tail = groups.slice(bestStart + bestLen).map((g) => g.toString(16)).join(":");
  return `${head}::${tail}`;
}

function splitPrefix(input: string): [string, string | null] {
  const slash = input.indexOf("/");
  if (slash === -1) return [input, null];
  return [input.slice(0, slash).trim(), input.slice(slash + 1).trim()];
}

function parsePrefix(prefixPart: string | null, version: 4 | 6): number {
  const label = version === 4 ? "IPv4" : "IPv6";
  const max = version === 4 ? 32 : 128;
  const fallback = version === 4 ? 32 : 64;
  if (prefixPart === null || prefixPart === "") return fallback;
  if (!/^\d{1,3}$/.test(prefixPart)) throw new Error(`"${prefixPart}" is not a valid prefix length.`);
  const prefix = Number(prefixPart);
  if (prefix > max) throw new Error(`A ${label} prefix is 0–${max}, not ${prefix}.`);
  return prefix;
}

/**
 * Analyze an IP address or CIDR block.
 *
 * - `192.168.1.0/24`, `10.0.0.5` (treated as /32)
 * - `2001:db8::/48`, `2001:db8:abcd::1` (treated as /64)
 */
export function analyzeIp(input: string): IpAnalysis {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Enter an IP address or CIDR block, e.g. 192.168.1.0/24 or 2001:db8::/48.");
  }
  if (trimmed.includes(":")) {
    const [address, prefixPart] = splitPrefix(trimmed);
    const value = parseIpv6(address);
    const prefix = parsePrefix(prefixPart, 6);
    const mask = prefix === 0 ? 0n : ((1n << 128n) - 1n) << BigInt(128 - prefix);
    const network = value & mask;
    const sizeExponent = 128 - prefix;
    const count = 1n << BigInt(sizeExponent);
    const last = network + count - 1n;
    return {
      version: 6,
      address: ipv6ToString(value),
      prefix,
      prefixWasDefaulted: prefixPart === null || prefixPart === "",
      network: ipv6ToString(network),
      firstAddress: ipv6ToString(network),
      lastAddress: ipv6ToString(last),
      sizeExponent,
      size: sizeExponent <= 20 ? count.toString() : `2^${sizeExponent}`,
    };
  }
  const [address, prefixPart] = splitPrefix(trimmed);
  const value = parseIpv4(address);
  const prefix = parsePrefix(prefixPart, 4);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (value & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const size = 2 ** (32 - prefix);
  let usable: number;
  let first: number;
  let last: number;
  if (prefix === 32) {
    usable = 1;
    first = network;
    last = broadcast;
  } else if (prefix === 31) {
    // RFC 3021: both addresses of a /31 are usable (point-to-point links).
    usable = 2;
    first = network;
    last = broadcast;
  } else {
    usable = size - 2;
    first = network + 1;
    last = broadcast - 1;
  }
  return {
    version: 4,
    address: ipv4ToString(value),
    prefix,
    network: ipv4ToString(network),
    broadcast: ipv4ToString(broadcast),
    size,
    usable,
    firstUsable: ipv4ToString(first),
    lastUsable: ipv4ToString(last),
  };
}
