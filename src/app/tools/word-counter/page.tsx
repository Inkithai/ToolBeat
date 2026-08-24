import { notFound } from "next/navigation";
import ToolShell from "@/components/tools/tool-shell";
import { getToolBySlug } from "@/lib/tools/registry";
import { TITLE_SUFFIX } from "@/constants/brand";
import WordCounterClient from "./word-counter-client";

const tool = getToolBySlug("word-counter");

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
      <WordCounterClient />
    </ToolShell>
  );
}
