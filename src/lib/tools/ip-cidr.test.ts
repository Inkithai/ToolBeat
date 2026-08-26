import { describe, expect, it } from "vitest";
import { analyzeIp, ipv4ToString, ipv6ToString, parseIpv4, parseIpv6 } from "./ip-cidr";

describe("parseIpv4", () => {
  it("parses a normal address", () => {
    expect(parseIpv4("192.168.1.1")).toBe(0xc0a80101);
  });

  it("parses extremes", () => {
    expect(parseIpv4("0.0.0.0")).toBe(0);
    expect(parseIpv4("255.255.255.255")).toBe(0xffffffff);
  });

  it("rejects bad input", () => {
    expect(() => parseIpv4("1.2.3")).toThrow(/four dot-separated octets/);
    expect(() => parseIpv4("256.0.0.1")).toThrow(/out of range/);
    expect(() => parseIpv4("1.2.3.a")).toThrow(/not a valid IPv4 octet/);
    expect(() => parseIpv4("01.2.3.4")).toThrow(/not a valid IPv4 octet/);
  });

  it("round-trips", () => {
    expect(ipv4ToString(parseIpv4("10.20.30.40"))).toBe("10.20.30.40");
  });
});

describe("parseIpv6", () => {
  it("parses a full address", () => {
    expect(parseIpv6("2001:0db8:0000:0000:0000:0000:0000:0001")).toBe(0x20010db8000000000000000000000001n);
  });

  it("parses compressed forms", () => {
    expect(parseIpv6("2001:db8::1")).toBe(0x20010db8000000000000000000000001n);
    expect(parseIpv6("::1")).toBe(1n);
    expect(parseIpv6("::")).toBe(0n);
    expect(parseIpv6("1::")).toBe(1n << 112n);
  });

  it("rejects bad input", () => {
    expect(() => parseIpv6("2001:db8:::1")).toThrow();
    expect(() => parseIpv6("2001:db8:1:1:1:1:1:1:1")).toThrow(/exactly 8/);
    expect(() => parseIpv6("2001:db8:1:1:1:1:1")).toThrow(/exactly 8/);
    expect(() => parseIpv6("::ffff:1.2.3.4")).toThrow(/IPv4-mapped/);
    expect(() => parseIpv6("2001:db8:g::1")).toThrow(/not a valid IPv6 group/);
  });

  it("round-trips through canonical compression (first longest zero run wins)", () => {
    expect(ipv6ToString(parseIpv6("2001:db8:0:0:1:0:0:1"))).toBe("2001:db8::1:0:0:1");
    expect(ipv6ToString(parseIpv6("2001:0db8:0000:0000:0000:0000:0000:0001"))).toBe("2001:db8::1");
    expect(ipv6ToString(0n)).toBe("::");
    expect(ipv6ToString(1n)).toBe("::1");
  });
});

describe("analyzeIp (IPv4)", () => {
  it("handles a /24 block", () => {
    const result = analyzeIp("192.168.1.0/24");
    expect(result.version).toBe(4);
    if (result.version !== 4) return;
    expect(result.network).toBe("192.168.1.0");
    expect(result.broadcast).toBe("192.168.1.255");
    expect(result.size).toBe(256);
    expect(result.usable).toBe(254);
    expect(result.firstUsable).toBe("192.168.1.1");
    expect(result.lastUsable).toBe("192.168.1.254");
  });

  it("treats a bare address as /32", () => {
    const result = analyzeIp("10.0.0.5");
    expect(result.version).toBe(4);
    if (result.version !== 4) return;
    expect(result.prefix).toBe(32);
    expect(result.usable).toBe(1);
    expect(result.firstUsable).toBe("10.0.0.5");
    expect(result.lastUsable).toBe("10.0.0.5");
  });

  it("handles /31 point-to-point (both usable)", () => {
    const result = analyzeIp("10.0.0.0/31");
    if (result.version !== 4) throw new Error("expected v4");
    expect(result.usable).toBe(2);
    expect(result.firstUsable).toBe("10.0.0.0");
    expect(result.lastUsable).toBe("10.0.0.1");
  });

  it("handles /0", () => {
    const result = analyzeIp("0.0.0.0/0");
    if (result.version !== 4) throw new Error("expected v4");
    expect(result.size).toBe(4294967296);
    expect(result.usable).toBe(4294967294);
  });

  it("masks a host address down to its network", () => {
    const result = analyzeIp("172.16.5.99/16");
    if (result.version !== 4) throw new Error("expected v4");
    expect(result.network).toBe("172.16.0.0");
    expect(result.broadcast).toBe("172.16.255.255");
  });

  it("rejects oversized prefixes", () => {
    expect(() => analyzeIp("10.0.0.0/33")).toThrow(/0–32/);
  });
});

describe("analyzeIp (IPv6)", () => {
  it("handles a /48 block", () => {
    const result = analyzeIp("2001:db8::/48");
    expect(result.version).toBe(6);
    if (result.version !== 6) return;
    expect(result.network).toBe("2001:db8::");
    expect(result.firstAddress).toBe("2001:db8::");
    expect(result.lastAddress).toBe("2001:db8:0:ffff:ffff:ffff:ffff:ffff");
    expect(result.sizeExponent).toBe(80);
    expect(result.size).toBe("2^80");
    expect(result.prefixWasDefaulted).toBe(false);
  });

  it("defaults a bare address to /64 and flags it", () => {
    const result = analyzeIp("2001:db8:abcd::1");
    if (result.version !== 6) throw new Error("expected v6");
    expect(result.prefix).toBe(64);
    expect(result.prefixWasDefaulted).toBe(true);
    expect(result.network).toBe("2001:db8:abcd::");
  });

  it("computes small blocks exactly", () => {
    const result = analyzeIp("2001:db8::/120");
    if (result.version !== 6) throw new Error("expected v6");
    expect(result.size).toBe("256");
    expect(result.lastAddress).toBe("2001:db8::ff");
  });

  it("rejects oversized prefixes", () => {
    expect(() => analyzeIp("2001:db8::/129")).toThrow(/0–128/);
  });
});
