import { notFound } from "next/navigation";
import ToolShell from "@/components/tools/tool-shell";
import { getToolBySlug } from "@/lib/tools/registry";
import { utilityToolMetadata } from "@/lib/seo/metadata";
import PercentageClient from "./percentage-client";

const tool = getToolBySlug("percentage-calculator");

export const metadata = tool ? utilityToolMetadata(tool) : { title: "Tool not found" };

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool}>
      <PercentageClient />
    </ToolShell>
  );
}
