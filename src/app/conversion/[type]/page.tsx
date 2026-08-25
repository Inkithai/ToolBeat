import { APP_NAME, TITLE_SUFFIX } from "@/constants/brand";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConversionClient from "./conversion-client";
import { CONVERSIONS, CONVERSION_ENTRIES, isConversionType } from "@/constants/app";
import { getToolBySlug } from "@/lib/tools/registry";
import { breadcrumbJsonLd, toolJsonLd } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/json-ld";

export function generateStaticParams() {
  return CONVERSION_ENTRIES.map(([type]) => ({ type }));
}

/**
 * Each converter is its own indexable page, so it needs its own title and
 * description rather than inheriting the generic site-wide metadata.
 */
export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  if (!isConversionType(type)) {
    return { title: `Conversion not found — ${TITLE_SUFFIX}` };
  }

  const conversion = CONVERSIONS[type];
  const title = `${conversion.fromFormat} to ${conversion.toFormat} Converter — ${TITLE_SUFFIX}`;
  const description = `${conversion.description} Converts ${conversion.from} to ${conversion.to} entirely in your browser — no uploads, no accounts, no cost.`;

  return {
    title,
    description,
    alternates: { canonical: `/conversion/${type}` },
    openGraph: { title, description, type: "website", siteName: APP_NAME },
  };
}

export default async function ConversionPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  // Unknown conversion types 404 at the routing layer. Rendering a "not
  // found" screen with a 200 status would give every typo its own indexable
  // URL. The client below keeps a defensive branch for the same case.
  if (!isConversionType(type)) notFound();

  const tool = getToolBySlug(type);
  if (!tool) notFound();

  return (
    <>
      <JsonLd data={toolJsonLd(tool)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Tools", href: "/tools" },
          { name: tool.name, href: tool.href },
        ])}
      />
      {/* The key guarantees that file/result state is cleared when a user changes
          conversion with the in-page format picker. */}
      <ConversionClient key={type} params={{ type }} />
    </>
  );
}
