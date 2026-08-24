import { APP_NAME, TITLE_SUFFIX } from "@/constants/brand";
import type { Metadata } from "next";
import ConversionClient from "./conversion-client";
import { CONVERSIONS, CONVERSION_ENTRIES, isConversionType } from "@/constants/app";

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
  // The key guarantees that file/result state is cleared when a user changes
  // conversion with the in-page format picker.
  return <ConversionClient key={type} params={{ type }} />;
}
