import { notFound } from "next/navigation";
import ToolShell from "@/components/tools/tool-shell";
import { getToolBySlug } from "@/lib/tools/registry";
import { utilityToolMetadata } from "@/lib/seo/metadata";
import Client from "./html-entities-client";

const tool = getToolBySlug("html-entities");

export const metadata = tool ? utilityToolMetadata(tool) : { title: "Tool not found" };

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool}>
      <Client />
    </ToolShell>
  );
}
