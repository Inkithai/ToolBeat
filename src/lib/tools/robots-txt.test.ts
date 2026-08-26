import { describe, expect, it } from "vitest";
import { checkPath, parseRobotsTxt } from "./robots-txt";

const SAMPLE = `
# robots.txt for example.com
User-agent: *
Disallow: /private/
Disallow: /tmp/
Allow: /public/
Crawl-delay: 10

User-agent: Googlebot
Disallow:
Allow: /private/admin/

User-agent: Bad*Bot
Disallow: /
`;

const parsed = parseRobotsTxt(SAMPLE);

describe("parseRobotsTxt", () => {
  it("groups rules by agent", () => {
    expect(parsed.groups).toHaveLength(3);
    expect(parsed.groups[0]?.agents).toEqual(["*"]);
    expect(parsed.groups[0]?.rules).toHaveLength(3);
    expect(parsed.groups[1]?.agents).toEqual(["Googlebot"]);
    expect(parsed.groups[2]?.agents).toEqual(["Bad*Bot"]);
  });

  it("captures crawl-delay and sitemaps", () => {
    expect(parsed.groups[0]?.crawlDelay).toBe(10);
    const withSitemap = parseRobotsTxt("user-agent: *\nsitemap: https://example.com/sitemap.xml\n");
    expect(withSitemap.sitemaps).toEqual(["https://example.com/sitemap.xml"]);
  });

  it("treats a value-less Disallow as no rule", () => {
    const noValue = parseRobotsTxt("user-agent: *\ndisallow:\n");
    expect(noValue.groups[0]?.rules).toEqual([]);
  });
});

describe("checkPath", () => {
  it("denies a generic Disallow for the wildcard agent", () => {
    const result = checkPath(parsed, "SomeCrawler", "/private/notes");
    expect(result.allowed).toBe(false);
    expect(result.matchedAgents).toEqual(["*"]);
  });

  it("lets a more specific Allow win over a broader Disallow", () => {
    // /public/ is allowed while /private/ is not; a path under /public wins.
    const result = checkPath(parsed, "SomeCrawler", "/public/open.txt");
    expect(result.allowed).toBe(true);
  });

  it("ignores query strings and fragments", () => {
    const result = checkPath(parsed, "SomeCrawler", "/private/notes?page=2#top");
    expect(result.allowed).toBe(false);
  });

  it("prefers the most specific literal agent group", () => {
    // Googlebot has its own group that allows /private/admin/.
    const result = checkPath(parsed, "Googlebot", "/private/admin/panel");
    expect(result.allowed).toBe(true);
    expect(result.groupFound).toBe(true);
  });

  it("uses only the literal agent group when one matches (wildcard rules ignored)", () => {
    // Googlebot has its own group with no Disallow for /private/notes, so the
    // wildcard group's Disallow does not apply to it.
    const result = checkPath(parsed, "Googlebot", "/private/notes");
    expect(result.allowed).toBe(true);
    expect(result.matchedAgents).toEqual(["Googlebot"]);
  });

  it("falls back to the wildcard group when no literal group matches", () => {
    const result = checkPath(parsed, "RandomBot", "/private/notes");
    expect(result.allowed).toBe(false);
    expect(result.matchedAgents).toEqual(["*"]);
  });

  it("matches agent wildcards", () => {
    const result = checkPath(parsed, "BadCrawlerBot", "/anything");
    expect(result.allowed).toBe(false);
    expect(result.matchedAgents).toEqual(["Bad*Bot"]);
  });

  it("allows everything when no group matches", () => {
    const literalOnly = parseRobotsTxt("user-agent: Googlebot\ndisallow: /\n");
    const result = checkPath(literalOnly, "UnlistedBot", "/whatever");
    expect(result.allowed).toBe(true);
    expect(result.groupFound).toBe(false);
  });

  it("honors anchored $ patterns and path wildcards", () => {
    const doc = parseRobotsTxt("user-agent: *\ndisallow: /files/*\nallow: /files/*.png$\n");
    expect(checkPath(doc, "bot", "/files/a.jpg").allowed).toBe(false);
    expect(checkPath(doc, "bot", "/files/a.png").allowed).toBe(true);
    // The $ anchor stops the Allow from matching .pngx.
    expect(checkPath(doc, "bot", "/files/a.pngx").allowed).toBe(false);
  });

  it("lets a same-length Allow beat a Disallow", () => {
    const doc = parseRobotsTxt("user-agent: *\ndisallow: /a\nallow: /a\n");
    expect(checkPath(doc, "bot", "/a/b").allowed).toBe(true);
  });
});
