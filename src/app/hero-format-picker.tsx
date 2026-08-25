"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { CONVERSION_ENTRIES, type ConversionType } from "@/constants/app";

const POPULAR: ConversionType[] = [
  "markdown-to-pdf",
  "png-to-jpg",
  "json-to-yaml",
  "webp-to-png",
  "csv-to-json",
  "docx-to-html",
];

const selectClass =
  "w-full appearance-none rounded-xl border border-white/10 bg-navy-900 py-3.5 pl-4 pr-10 text-sm font-semibold text-white outline-none transition-colors hover:border-white/20 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * The landing hero's primary action. Users pick both formats here and go
 * straight to the converter, so the first viewport answers "what can this
 * convert?" instead of asking the visitor to scroll for evidence.
 */
export default function HeroFormatPicker() {
  const router = useRouter();
  const [fromFormat, setFromFormat] = useState("");
  const [conversionType, setConversionType] = useState<ConversionType | "">("");

  const sourceFormats = useMemo(
    () => Array.from(new Set(CONVERSION_ENTRIES.map(([, conversion]) => conversion.fromFormat))).sort(),
    [],
  );

  const availableTargets = useMemo(
    () => (fromFormat ? CONVERSION_ENTRIES.filter(([, conversion]) => conversion.fromFormat === fromFormat) : []),
    [fromFormat],
  );

  const selected = conversionType
    ? CONVERSION_ENTRIES.find(([type]) => type === conversionType)?.[1]
    : undefined;

  const chooseSource = (nextSource: string) => {
    setFromFormat(nextSource);
    // Only one destination? Pre-select it so the user never makes a dead choice.
    const targets = CONVERSION_ENTRIES.filter(([, conversion]) => conversion.fromFormat === nextSource);
    setConversionType(targets.length === 1 ? targets[0][0] : "");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (conversionType) router.push(`/conversion/${conversionType}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left shadow-2xl shadow-navy-950/60 backdrop-blur-sm sm:p-5"
        aria-labelledby="hero-picker-heading"
      >
        <h2 id="hero-picker-heading" className="sr-only">
          Choose a conversion
        </h2>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end sm:gap-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Convert from
            </span>
            <div className="relative">
              <select
                value={fromFormat}
                onChange={(event) => chooseSource(event.target.value)}
                className={selectClass}
              >
                <option value="">Select format</option>
                {sourceFormats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </label>

              <div className="hidden pb-3.5 text-center sm:block" aria-hidden="true">
            <ArrowRight className="h-5 w-5 text-indigo-400" />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Convert to
            </span>
            <div className="relative">
              <select
                value={conversionType}
                onChange={(event) => setConversionType(event.target.value as ConversionType | "")}
                disabled={!fromFormat}
                className={selectClass}
              >
                <option value="">{fromFormat ? "Select format" : "Pick a source first"}</option>
                {availableTargets.map(([type, conversion]) => (
                  <option key={type} value={type}>
                    {conversion.toFormat}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={!conversionType}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selected ? `Convert ${selected.fromFormat} to ${selected.toFormat}` : "Choose both formats to continue"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-2.5 min-h-8 text-center text-xs leading-relaxed text-slate-400" aria-live="polite">
          {selected ? selected.description : `${CONVERSION_ENTRIES.length} converters ready — nothing is uploaded.`}
        </p>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Popular</span>
        {POPULAR.map((type) => {
          const conversion = CONVERSION_ENTRIES.find(([key]) => key === type)?.[1];
          if (!conversion) return null;
          return (
            <Link
              key={type}
              href={`/conversion/${type}`}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-white"
            >
              {conversion.fromFormat} <span className="text-indigo-400">→</span> {conversion.toFormat}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
