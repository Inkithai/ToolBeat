import "./globals.css";
import { APP_NAME, SITE_URL, TAGLINE } from "@/constants/brand";
import { TOOLS } from "@/lib/tools/registry";
import { describePlatformProcessing } from "@/lib/tools/capabilities";
import { websiteJsonLd } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/json-ld";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

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
  openGraph: { title, description, siteName: APP_NAME, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Chrome lives in the layout so every route gets it, including
          /_not-found, which previously rendered with no header or footer. */}
      <body className="min-h-screen bg-navy-950 text-ink-50 font-sans">
        {/* Site-level structured data; page-level entities are on their pages. */}
        <JsonLd data={websiteJsonLd()} />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
