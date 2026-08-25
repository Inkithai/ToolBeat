import type { Metadata } from "next";
import { APP_NAME, TITLE_SUFFIX } from "@/constants/brand";
import type { ToolDefinition } from "@/lib/tools/types";

/**
 * Page metadata for a registry tool, derived the same way as its directory
 * card so the two cannot drift. Every tool page uses this; none of them
 * hand-writes a title any more.
 */
export function utilityToolMetadata(tool: ToolDefinition): Metadata {
  const title = `${tool.name} — ${TITLE_SUFFIX}`;
  return {
    title,
    description: tool.summary,
    alternates: { canonical: tool.href },
    openGraph: { title, description: tool.summary, type: "website", siteName: APP_NAME },
  };
}
