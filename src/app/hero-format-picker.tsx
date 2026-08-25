"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
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
  "field w-full appearance-none py-3.5 pl-4 pr-10 text-sm font-semibold";

/**
 * The landing hero's primary action. Users pick both formats here and go
 * straight to the converter.
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
        className="glass-panel relative overflow-hidden p-4 text-left sm:p-6"
        aria-labelledby="hero-picker-heading"
      >
        {/* Soft animated edge light */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-fuchsia-500/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 animate-pulse-soft text-cyan-400" aria-hidden="true" />
              Quick convert
            </p>
            <h2 id="hero-picker-heading" className="text-base font-bold text-white sm:text-lg">
              What do you want to convert?
            </h2>
          </div>
          <span className="hidden rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 sm:inline">
            {CONVERSION_ENTRIES.length} converters
          </span>
        </div>

        <div className="relative grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end sm:gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
              From
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
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            </div>
          </label>

          <div className="hidden pb-3.5 text-center sm:block" aria-hidden="true">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-400/25 bg-gradient-to-br from-indigo-500/20 to-cyan-500/15 shadow-[0_0_20px_-6px_rgba(139,92,246,0.6)]">
              <ArrowRight className="h-4 w-4 text-cyan-300" />
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
              To
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
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            </div>
          </label>
        </div>

        <button type="submit" disabled={!conversionType} className="btn-primary relative mt-4 w-full py-3.5">
          {selected
            ? `Convert ${selected.fromFormat} to ${selected.toFormat}`
            : "Choose both formats to continue"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="relative mt-3 min-h-5 text-center text-xs leading-relaxed text-ink-500" aria-live="polite">
          {selected
            ? selected.description
            : "Files stay on your device — nothing is uploaded."}
        </p>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
          Popular
        </span>
        {POPULAR.map((type, index) => {
          const conversion = CONVERSION_ENTRIES.find(([key]) => key === type)?.[1];
          if (!conversion) return null;
          return (
            <Link
              key={type}
              href={`/conversion/${type}`}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-ink-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/45 hover:bg-indigo-500/15 hover:text-white hover:shadow-[0_8px_20px_-12px_rgba(139,92,246,0.7)]"
              style={{ animationDelay: `${0.3 + index * 0.04}s` }}
            >
              {conversion.fromFormat} <span className="text-cyan-400">→</span> {conversion.toFormat}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
