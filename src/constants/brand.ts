/**
 * Single source of truth for brand strings.
 *
 * These were previously hard-coded in seven places (layout metadata, header,
 * footer, tools page, per-conversion metadata, DOCX document properties). That
 * meant the product name could not change without a risky find-and-replace
 * across both UI copy and generated file metadata.
 *
 * The name is unchanged; only its ownership moved. Renaming the product is now
 * an edit to this file.
 */

/** Rendered as two tones in the header and footer wordmark. */
export const BRAND_NAME_PARTS = { lead: "Convert", accent: "Lab" } as const;

export const APP_NAME = `${BRAND_NAME_PARTS.lead}${BRAND_NAME_PARTS.accent}`;

export const TAGLINE = "Your conversion laboratory.";

/** Used as the metadata title suffix, e.g. "CSV to JSON Converter — ConvertLab". */
export const TITLE_SUFFIX = APP_NAME;

export const REPOSITORY_URL = "https://github.com/Inkithai/ConvertLab";

/**
 * Attribution written into generated documents (DOCX core properties). Kept
 * here so exported files never drift from the visible product name.
 */
export const DOCUMENT_CREATOR = APP_NAME;
