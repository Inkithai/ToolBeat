import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/constants/brand";
import { getToolBySlug, TOOLS } from "@/lib/tools/registry";
import { breadcrumbJsonLd, toolJsonLd, toolListJsonLd, websiteJsonLd } from "./schema";

const lookup = (slug: string) => {
  const tool = getToolBySlug(slug);
  if (!tool) throw new Error(`${slug} missing from the registry`);
  return tool;
};

describe("websiteJsonLd", () => {
  it("describes the site with an absolute URL", () => {
    const data = websiteJsonLd();
    expect(data["@type"]).toBe("WebSite");
    expect(data.url).toBe(SITE_URL);
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers positions from 1 and builds absolute item URLs", () => {
    const data = breadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Tools", href: "/tools" },
      { name: "Pomodoro Timer", href: "/tools/pomodoro" },
    ]);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools` },
      { "@type": "ListItem", position: 3, name: "Pomodoro Timer", item: `${SITE_URL}/tools/pomodoro` },
    ]);
  });
});

describe("toolJsonLd", () => {
  it("describes a utility tool with free browser access", () => {
    const data = toolJsonLd(lookup("json-formatter"));
    expect(data["@type"]).toBe("WebApplication");
    expect(data.name).toBe("JSON Formatter");
    expect(data.url).toBe(`${SITE_URL}/tools/json-formatter`);
    expect(data.applicationCategory).toBe("Developer & Data");
    expect(data.offers).toEqual({ "@type": "Offer", price: "0", priceCurrency: "USD" });
    expect(data.isAccessibleForFree).toBe(true);
  });

  it("adds the on-device feature claim only for on-device tools", () => {
    const onDevice = toolJsonLd(lookup("json-formatter"));
    expect(Array.isArray(onDevice.featureList)).toBe(true);

    const serverTool = {
      ...lookup("json-formatter"),
      capabilities: { ...lookup("json-formatter").capabilities, processing: "server" as const },
    };
    // The privacy featureList is derived from capabilities, not copied along.
    expect(toolJsonLd(serverTool).featureList).toBeUndefined();
  });

  it("gives converters a converter-style alternate name", () => {
    const data = toolJsonLd(lookup("csv-to-json"));
    expect(data.alternateName).toBe("CSV (.csv) to JSON (.json) converter");
    expect(toolJsonLd(lookup("pomodoro")).alternateName).toBeUndefined();
  });
});

describe("toolListJsonLd", () => {
  it("lists every registered tool with its absolute URL", () => {
    const data = toolListJsonLd(TOOLS);
    expect(data["@type"]).toBe("ItemList");
    expect(data.numberOfItems).toBe(TOOLS.length);
    const items = data.itemListElement as { position: number; url: string }[];
    expect(items).toHaveLength(TOOLS.length);
    expect(items[0].url.startsWith(SITE_URL)).toBe(true);
    expect(items.map((item) => item.position)).toEqual(TOOLS.map((_, index) => index + 1));
  });
});
