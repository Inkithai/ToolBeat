"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronDown, FileInput, FileOutput, Grid2X2 } from "lucide-react";
import { CONVERSION_ENTRIES, FILE_LIMIT_MB, type ConversionType } from "@/constants/app";

const selectClass =
  "w-full appearance-none rounded-xl border border-white/10 bg-navy-900 py-3 pl-4 pr-10 text-sm font-semibold text-white outline-none transition-colors hover:border-white/20 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50";

export default function ConversionPicker() {
  const router = useRouter();
  const [fromFormat, setFromFormat] = useState("");
  const [conversionType, setConversionType] = useState<ConversionType | "">("");

  const sourceFormats = useMemo(
    () => Array.from(new Set(CONVERSION_ENTRIES.map(([, conversion]) => conversion.fromFormat))).sort(),
    [],
  );
  const availableConversions = useMemo(
    () => (fromFormat ? CONVERSION_ENTRIES.filter(([, conversion]) => conversion.fromFormat === fromFormat) : []),
    [fromFormat],
  );
  const selectedConversion = conversionType
    ? CONVERSION_ENTRIES.find(([type]) => type === conversionType)
    : undefined;

  const chooseSource = (nextSource: string) => {
    setFromFormat(nextSource);
    // Auto-select when a source has exactly one destination, so the user is
    // never asked to make a choice that has only one possible answer.
    const targets = CONVERSION_ENTRIES.filter(([, conversion]) => conversion.fromFormat === nextSource);
    setConversionType(targets.length === 1 ? targets[0][0] : "");
  };

  const startConversion = (event: React.FormEvent) => {
    event.preventDefault();
    if (conversionType) router.push(`/conversion/${conversionType}`);
  };

  return (
      <form
      onSubmit={startConversion}
      className="rounded-3xl border border-indigo-400/15 bg-gradient-to-br from-indigo-500/[0.08] via-white/[0.025] to-transparent p-5 shadow-2xl shadow-indigo-950/20 sm:p-6"
      aria-labelledby="format-selector-heading"
    >
      <div className="mb-5 sm:mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Format selector</p>
        <h2 id="format-selector-heading" className="text-xl font-extrabold text-white sm:text-2xl">What do you want to convert?</h2>
        <p className="mt-1 text-sm text-ink-200">Pick both formats, then add your file on the next step.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end sm:gap-3">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-100">
            <FileInput className="h-4 w-4 text-indigo-400" /> From
          </span>
          <div className="relative">
            <select value={fromFormat} onChange={(event) => chooseSource(event.target.value)} className={selectClass}>
              <option value="">Select input format</option>
              {sourceFormats.map((format) => <option key={format} value={format}>{format}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>

        <div className="hidden pb-3 text-center sm:block" aria-hidden="true">
          <ArrowRight className="h-5 w-5 text-indigo-400" />
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-100">
            <FileOutput className="h-4 w-4 text-indigo-400" /> To
          </span>
          <div className="relative">
            <select
              value={conversionType}
              onChange={(event) => setConversionType(event.target.value as ConversionType | "")}
              disabled={!fromFormat}
              className={selectClass}
            >
              <option value="">{fromFormat ? "Select output format" : "Choose an input format first"}</option>
              {availableConversions.map(([type, conversion]) => (
                <option key={type} value={type}>{conversion.toFormat}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-white/5 bg-navy-950/50 p-3.5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-4">
        <div className="min-h-11" aria-live="polite">
          {selectedConversion ? (
            <>
              <p className="font-bold text-white">
                {selectedConversion[1].fromFormat} <span className="text-indigo-400">→</span> {selectedConversion[1].toFormat}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-200">
                {selectedConversion[1].description} Accepts {selectedConversion[1].acceptedExtensions.join(", ")} up to {FILE_LIMIT_MB} MB.
              </p>
            </>
          ) : (
            <p className="py-2 text-sm text-slate-400">Your selected conversion will appear here.</p>
          )}
        </div>
        <button
          type="submit"
          disabled={!conversionType}
          className="mt-3 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 sm:mt-0 sm:w-auto"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 text-center">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-indigo-200">
          <Grid2X2 className="h-4 w-4" /> Or browse every conversion
        </Link>
      </div>
    </form>
  );
}
