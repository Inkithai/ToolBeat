import { CATEGORIES } from "@/constants/app";
import { APP_NAME, SITE_URL } from "@/constants/brand";
import { isConversionTool, type ToolDefinition } from "@/lib/tools/types";

/**
 * JSON-LD builders for structured data.
 *
 * Every URL is derived from `SITE_URL` and every fact from the tool registry,
 * so structured data cannot claim something a tool page no longer says. The
 * output is plain JSON built with `JSON.stringify` at render time — no
 * dependencies worth having for this.
 */

export type JsonLdObject = Record<string, unknown>;

export type BreadcrumbItem = { name: string; href: string };

function categoryLabel(key: string): string {
  return CATEGORIES.find((category) => category.key === key)?.label ?? key;
}

/** Site-level entity, rendered once in the root layout. */
export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: SITE_URL,
  };
}

/** Breadcrumbs, visible nav and structured data built from the same items. */
export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

/**
 * A tool as a WebApplication. The privacy claim is derived from capabilities
 * for the same reason as the visible badges: it must stop being emitted the
 * moment a tool stops deserving it.
 */
export function toolJsonLd(tool: ToolDefinition): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.summary,
    url: `${SITE_URL}${tool.href}`,
    applicationCategory: categoryLabel(tool.category),
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    ...(tool.capabilities.processing === "on-device"
      ? { featureList: ["Runs entirely in the browser without uploading files"] }
      : {}),
    ...(isConversionTool(tool)
      ? {
          alternateName: `${tool.conversion.from} to ${tool.conversion.to} converter`,
        }
      : {}),
  };
}

/** The directory as an ItemList so search engines see the full catalog. */
export function toolListJsonLd(tools: readonly ToolDefinition[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}${tool.href}`,
      name: tool.name,
    })),
  };
}
