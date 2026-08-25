import "./globals.css";
import { APP_NAME, SITE_URL, TAGLINE } from "@/constants/brand";
import { TOOLS } from "@/lib/tools/registry";
import { describePlatformProcessing } from "@/lib/tools/capabilities";
import { websiteJsonLd } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/json-ld";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PwaRegister from "@/components/pwa-register";

const title = `${APP_NAME} — Fast Browser Tools for Everyday Tasks`;
/**
 * The site-wide claim is generated from tool capabilities rather than written
 * by hand, so it degrades automatically if a server-backed tool is ever added.
 */
const description = `${TAGLINE} ${describePlatformProcessing(TOOLS)}`;

export const metadata = {
  // Without metadataBase, Next.js resolves og:url and canonical links against
  // the request host, which serves preview URLs as canonical in production.
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    siteName: APP_NAME,
    type: "website",
    images: [{ url: "/opengraph-image.svg", width: 1200, height: 630, alt: `${APP_NAME} — ${TAGLINE}` }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Chrome lives in the layout so every route gets it, including
          /_not-found, which previously rendered with no header or footer. */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Root layout loads these for every route; the pages-router rule is a false positive here. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-navy-950 font-sans text-ink-50">
        <div className="relative z-10 flex min-h-screen flex-col">
          {/* Site-level structured data; page-level entities are on their pages. */}
          <JsonLd data={websiteJsonLd()} />
          <PwaRegister />
          <a href="#main-content" className="sr-only z-[100] rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
            Skip to main content
          </a>
          <Header />
          <div id="main-content" className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
