import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/brand";
import { TOOLS } from "@/lib/tools/registry";

/**
 * Sitemap generated from the registry: adding a tool (converter or utility)
 * is the only edit needed for it to appear here, in the directory and in the
 * ItemList structured data.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tools`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/conversion`, lastModified, changeFrequency: "weekly", priority: 0.7 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${SITE_URL}${tool.href}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...routes, ...toolRoutes];
}
