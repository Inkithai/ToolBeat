/**
 * Single source of truth for brand strings.
 *
 * These were previously hard-coded in seven places (layout metadata, header,
 * footer, tools page, per-conversion metadata, DOCX document properties). That
 * meant the product name could not change without a risky find-and-replace
 * across both UI copy and generated file metadata.
 *
 * The name is now ToolBeat; renaming the product requires an edit to this file.
 */

/** Rendered as two tones in the header and footer wordmark. */
export const BRAND_NAME_PARTS = { lead: "Tool", accent: "Beat" } as const;

export const APP_NAME = `${BRAND_NAME_PARTS.lead}${BRAND_NAME_PARTS.accent}`;

export const TAGLINE = "Useful tools. Right in your browser.";

/** Used as the metadata title suffix, e.g. "CSV to JSON Converter — ToolBeat". */
export const TITLE_SUFFIX = APP_NAME;

export const REPOSITORY_URL = "https://github.com/Inkithai/ToolBeat";

/**
 * Canonical origin for metadataBase, the sitemap, robots.txt and JSON-LD URLs.
 * Set `NEXT_PUBLIC_SITE_URL` in the deployment environment (for example
 * `https://toolbeat.example.com`); a localhost fallback keeps local builds
 * from silently emitting metadata with relative-only URLs, which Next.js
 * warns about and search engines ignore.
 */
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Same origin, normalized: no trailing slash, so joins never double it. */
export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "");

/**
 * Attribution written into generated documents (DOCX core properties). Kept
 * here so exported files never drift from the visible product name.
 */
export const DOCUMENT_CREATOR = APP_NAME;
