import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * Tools that are on the roadmap but not built yet. This is a promise, not a
 * feature: only list something here once it is genuinely next (see
 * docs/EXPANSION_ROADMAP.md). Dead "coming soon" links are worse than none.
 */
const UPCOMING = [
  "PDF Merge",
  "PDF Split",
  "Image Cropper",
  "Image Color Picker",
  "Image to Base64",
  "JSON to Python/Go Types",
  "Cron Generator & Explainer",
  "Mortgage Calculator",
  "Business Days Calculator",
  "Countdown Timer",
  "Random Picker",
  "AI Summarizer (bring your own key)",
];

export default function UpcomingTools() {
  return (
    <section className="border-b border-white/[0.06] px-4 py-12 sm:px-6 sm:py-16" aria-label="Upcoming tools">
      <div className="mx-auto max-w-4xl">
        <p className="meta mb-3 flex items-center gap-1.5 text-ink-500">
          <Sparkles className="h-3.5 w-3.5" /> On the bench
        </p>
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Shipping next — all still running locally in your browser
        </h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {UPCOMING.map((label) => (
            <li
              key={label}
              className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-ink-300"
            >
              {label}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-500">
          Missing something? Browse the{" "}
          <Link href="/tools" className="font-semibold text-indigo-300 transition-colors hover:text-indigo-200">
            {`full directory`}
          </Link>{" "}
          first — then the roadmap in the project docs is open to suggestions.
          <ArrowRight className="ml-1 inline h-3 w-3 text-ink-600" aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
