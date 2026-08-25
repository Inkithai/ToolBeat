import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/brand";

/**
 * Every page is static, indexable content with no query-param variants, so
 * the policy is simply "allow everything" plus the sitemap pointer. Keeping
 * this a route (rather than a static file) means it reads SITE_URL like every
 * other SEO surface instead of hard-coding a domain here too.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
