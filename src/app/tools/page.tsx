import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import ToolDirectory from "./tool-directory";
import { TOOLS } from "@/lib/tools/registry";
import { describePlatformProcessing, describePlatformProcessingShort } from "@/lib/tools/capabilities";
import { toolListJsonLd } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/json-ld";
import { APP_NAME, TAGLINE, TITLE_SUFFIX } from "@/constants/brand";

export const metadata = {
  title: `All Tools — ${TITLE_SUFFIX}`,
  description: `${TAGLINE} Browse all ${TOOLS.length} ${APP_NAME} tools for documents, images, data and everyday utilities. ${describePlatformProcessingShort(TOOLS)}.`,
  alternates: { canonical: "/tools" },
};

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "all" } = await searchParams;

  return (
    <div className="min-h-screen bg-navy-950">
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-200 hover:text-indigo-400">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <span className="hidden items-center gap-2 text-xs font-semibold text-indigo-300 sm:inline-flex">
            <LockKeyhole className="h-3.5 w-3.5" /> {describePlatformProcessingShort(TOOLS)}
          </span>
        </div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">{APP_NAME} tools</div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Choose a tool</h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-ink-200 sm:text-right">{describePlatformProcessing(TOOLS)}</p>
        </div>
        {/* The catalog as structured data, generated from the same registry
            the directory below renders from. */}
        <JsonLd data={toolListJsonLd(TOOLS)} />
        <ToolDirectory initialCategory={category} />
      </main>
    </div>
  );
}
