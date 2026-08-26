import Link from "next/link";
import AmbientBackground from "@/components/layout/ambient-background";
import ActionMarquee from "@/components/layout/action-marquee";
import TrustStrip from "@/components/layout/trust-strip";
import CategoryDirectory from "@/components/layout/category-directory";
import StartUseful from "@/components/layout/start-useful";
import PersonalizedHome from "@/components/layout/personalized-home";
import WhyConvertLab from "@/components/layout/why-convertlab";
import UpcomingTools from "@/components/layout/upcoming-tools";
import SearchTrigger from "@/components/layout/search-trigger";
import { TOOLS } from "@/lib/tools/registry";

const QUICK_LINKS = [
  { label: "Convert a file", href: "/conversion/png-to-jpg" },
  { label: "Format JSON", href: "/tools/json-formatter" },
  { label: "Count words", href: "/tools/word-counter" },
  { label: "Calculate", href: "/tools/percentage-calculator" },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-navy-950">
      <main>
        <section className="relative px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16">
          <AmbientBackground variant="hero" />

          <div className="relative mx-auto max-w-4xl text-center">
            <p className="meta mb-5 text-ink-400">
              {TOOLS.length}+ useful tools · zero signups
            </p>

            <h1 className="mb-8 text-[2.6rem] font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Do the task.
              <br />
              <span className="text-ink-300">Not the setup.</span>
            </h1>

            <SearchTrigger variant="hero" />

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-ink-400">
              {QUICK_LINKS.map((item, index) => (
                <span key={item.href} className="inline-flex items-center gap-3">
                  {index > 0 && <span className="hidden text-ink-700 sm:inline" aria-hidden="true">·</span>}
                  <Link href={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </section>

        <ActionMarquee />
        <TrustStrip />
        <CategoryDirectory />
        <StartUseful />
        <PersonalizedHome />
        <WhyConvertLab />
        <UpcomingTools />

        <section className="px-4 py-16 sm:px-6 sm:py-20" aria-label="Find a tool">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What do you need to do?
            </h2>
            <div className="mt-8">
              <SearchTrigger variant="cta" />
            </div>
            <p className="meta mt-5 text-ink-500">
              {TOOLS.length}+ tools · no account · right in your browser
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
