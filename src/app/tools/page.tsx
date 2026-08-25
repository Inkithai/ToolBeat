import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import ToolDirectory from "./tool-directory";
import AmbientBackground from "@/components/layout/ambient-background";
import { TOOLS } from "@/lib/tools/registry";
import { describePlatformProcessing, describePlatformProcessingShort } from "@/lib/tools/capabilities";
import { toolListJsonLd } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/json-ld";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { APP_NAME, TAGLINE, TITLE_SUFFIX } from "@/constants/brand";

export const metadata = {
  title: `All Tools — ${TITLE_SUFFIX}`,
  description: `${TAGLINE} Browse all ${TOOLS.length} ${APP_NAME} tools for documents, images, data and everyday utilities. ${describePlatformProcessingShort(TOOLS)}.`,
  alternates: { canonical: "/tools" },
};

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category = "all", search = "" } = await searchParams;

  return (
    <div className="relative overflow-hidden bg-navy-950">
      <AmbientBackground variant="page" />
      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
          ]}
          className="mb-6"
        />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl animate-fade-up">
            <p className="meta mb-2 text-ink-500">
              Tool directory
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Find the right tool
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-400 sm:text-base">
              Search by name or format, filter by category, or jump back into something you used
              recently. {describePlatformProcessing(TOOLS)}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 delay-2">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            {describePlatformProcessingShort(TOOLS)}
          </span>
        </div>

        <JsonLd data={toolListJsonLd(TOOLS)} />
        <ToolDirectory initialCategory={category} initialSearch={search} />

        <p className="mt-10 text-center text-sm text-ink-500">
          Looking for something else?{" "}
          <Link href="/" className="font-semibold text-indigo-300 transition-colors hover:text-white">
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
