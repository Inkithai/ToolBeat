import { notFound } from "next/navigation";
import ToolShell from "@/components/tools/tool-shell";
import { getToolBySlug } from "@/lib/tools/registry";
import { TITLE_SUFFIX } from "@/constants/brand";
import JsonFormatterClient from "./json-formatter-client";

const tool = getToolBySlug("json-formatter");

/**
 * Metadata is derived from the registry entry, so a tool's name and summary
 * cannot drift between its card in the directory and its page title.
 */
export const metadata = {
  title: `${tool?.name ?? "Tool"} — ${TITLE_SUFFIX}`,
  description: tool?.summary,
};

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool}>
      <JsonFormatterClient />
    </ToolShell>
  );
}
