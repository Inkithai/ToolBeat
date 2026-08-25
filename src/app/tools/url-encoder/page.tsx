import { notFound } from "next/navigation";
import ToolShell from "@/components/tools/tool-shell";
import { getToolBySlug } from "@/lib/tools/registry";
import { utilityToolMetadata } from "@/lib/seo/metadata";
import UrlEncoderClient from "./url-encoder-client";

const tool = getToolBySlug("url-encoder");

export const metadata = tool ? utilityToolMetadata(tool) : { title: "Tool not found" };

export default function Page() {
  if (!tool) notFound();
  return (
    <ToolShell tool={tool}>
      <UrlEncoderClient />
    </ToolShell>
  );
}
