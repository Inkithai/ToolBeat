import { notFound } from "next/navigation";
import ToolShell from "@/components/tools/tool-shell";
import { getToolBySlug } from "@/lib/tools/registry";
import { utilityToolMetadata } from "@/lib/seo/metadata";
import JsonFormatterClient from "./json-formatter-client";

const tool = getToolBySlug("json-formatter");

/**
 * Metadata is derived from the registry entry, so a tool's name and summary
 * cannot drift between its card in the directory and its page title.
 */
export const metadata = tool ? utilityToolMetadata(tool) : { title: "Tool not found" };

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool}>
      <JsonFormatterClient />
    </ToolShell>
  );
}
