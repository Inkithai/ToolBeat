"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowRightLeft,
  UploadCloud,
  Settings,
  CheckCircle2,
  Download,
  RotateCcw,
  FileType,
  Grid2X2,
  X,
} from "lucide-react";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import {
  CONVERSIONS,
  CONVERSION_ENTRIES,
  FILE_LIMIT_MB,
  isConversionType,
  type ConversionType,
} from "@/constants/app";
import { getConversionRunner } from "@/lib/converters/runners";
import { getToolBySlug } from "@/lib/tools/registry";
import CapabilityBadges from "@/components/tools/capability-badges";
import RecordToolVisit from "@/components/tools/record-tool-visit";

const TEXT_EXTENSIONS = new Set([
  ".md", ".markdown", ".txt", ".json", ".yaml", ".yml", ".csv", ".html", ".htm", ".xml",
]);

function extensionFor(name: string): string {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}

function outputFileName(name: string, extension: string): string {
  const lastDot = name.lastIndexOf(".");
  const base = lastDot > 0 ? name.slice(0, lastDot) : name;
  return `${base || "converted"}${extension}`;
}

function titleFromFileName(name: string): string {
  const lastDot = name.lastIndexOf(".");
  return lastDot > 0 ? name.slice(0, lastDot) : name;
}



export default function ConversionClient({ params }: { params: { type: string } }) {
  const { type } = params;
  const router = useRouter();
  const conversion = isConversionType(type) ? CONVERSIONS[type] : null;
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState("");
  const [convertedName, setConvertedName] = useState("");
  const [error, setError] = useState("");
  const [pageSize, setPageSize] = useState("A4");
  const [font, setFont] = useState("System");
  const [imageQuality, setImageQuality] = useState(92);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const convertedUrlRef = useRef("");

  const pdfFontFamily = font === "Serif"
    ? "Georgia, 'Times New Roman', serif"
    : "Arial, Helvetica, sans-serif";

  const sourceFormats = useMemo(
    () => Array.from(new Set(CONVERSION_ENTRIES.map(([, item]) => item.fromFormat))).sort(),
    [],
  );
  const sourceTools = conversion
    ? CONVERSION_ENTRIES.filter(([, item]) => item.fromFormat === conversion.fromFormat)
    : [];
  const reverseTool = conversion
    ? CONVERSION_ENTRIES.find(([, item]) =>
        item.fromFormat === conversion.toFormat && item.toFormat === conversion.fromFormat)
    : undefined;
  const relatedTools = conversion
    ? CONVERSION_ENTRIES.filter(([key, item]) => key !== type && item.category === conversion.category).slice(0, 8)
    : [];

  const revokeConvertedUrl = useCallback(() => {
    if (convertedUrlRef.current.startsWith("blob:")) URL.revokeObjectURL(convertedUrlRef.current);
    convertedUrlRef.current = "";
  }, []);

  useEffect(() => () => revokeConvertedUrl(), [revokeConvertedUrl]);

  const updateConvertedFile = useCallback((blob: Blob, name: string) => {
    revokeConvertedUrl();
    const url = URL.createObjectURL(blob);
    convertedUrlRef.current = url;
    setConvertedUrl(url);
    setConvertedName(name);
  }, [revokeConvertedUrl]);

  const clearResult = useCallback(() => {
    revokeConvertedUrl();
    setConvertedUrl("");
    setConvertedName("");
  }, [revokeConvertedUrl]);

  const reset = useCallback(() => {
    clearResult();
    setFile(null);
    setPreviewText("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [clearResult]);

  const goToTool = useCallback((nextType: ConversionType) => {
    router.push(`/conversion/${nextType}`);
  }, [router]);

  const handleSourceChange = (fromFormat: string) => {
    const firstMatch = CONVERSION_ENTRIES.find(([, item]) => item.fromFormat === fromFormat);
    if (firstMatch) goToTool(firstMatch[0]);
  };

  const handleFile = useCallback(async (nextFile: File) => {
    if (!conversion) return;
    setError("");
    setFile(null);
    setPreviewText("");
    clearResult();

    const rejectFile = (message: string) => {
      setError(message);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    if (nextFile.size === 0) {
      rejectFile("The selected file is empty. Choose a file that contains content.");
      return;
    }
    if (nextFile.size > FILE_LIMIT_MB * 1024 * 1024) {
      rejectFile(`File exceeds the ${FILE_LIMIT_MB} MB limit. Choose a smaller file.`);
      return;
    }
    const extension = extensionFor(nextFile.name);
    if (!(conversion.acceptedExtensions as readonly string[]).includes(extension)) {
      rejectFile(`Choose a ${conversion.acceptedExtensions.join(" or ")} file for ${conversion.fromFormat} → ${conversion.toFormat}.`);
      return;
    }

    setFile(nextFile);
    if (TEXT_EXTENSIONS.has(extension)) {
      const text = await nextFile.text();
      setPreviewText(text.slice(0, 5000) + (text.length > 5000 ? "\n\n… Preview truncated" : ""));
    } else if (conversion.category === "images") {
      setPreviewText("Image ready. Its original dimensions are retained during conversion.");
    } else {
      setPreviewText("Binary document ready. A text preview is not available for this file type.");
    }
  }, [clearResult, conversion]);

  const handleConvert = useCallback(async () => {
    if (!file || !conversion || !isConversionType(type)) return;
    setIsConverting(true);
    setError("");

    try {
      const outputName = outputFileName(file.name, conversion.outputExtension);
      const title = titleFromFileName(file.name);

      // Dispatch is data-driven: the runner map is exhaustive over
      // ConversionType, and each runner imports only what it needs.
      const blob = await getConversionRunner(type)(file, {
        pdfFontFamily,
        pageSize: pageSize as "A4" | "Letter" | "Auto",
        imageQuality,
        title,
      });
      updateConvertedFile(blob, outputName);
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : "Conversion failed.";
      setError(message || "Conversion failed. Check the source file and try again.");
    } finally {
      setIsConverting(false);
    }
  }, [conversion, file, imageQuality, pageSize, pdfFontFamily, type, updateConvertedFile]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) void handleFile(dropped);
  }, [handleFile]);

  // Defensive: the route's server component 404s unknown types before this
  // component renders, so this branch is a last line of defence rather than
  // the primary not-found experience.
  if (!conversion) {
    return (
      <div className="min-h-screen bg-navy-950">
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <FileType className="h-8 w-8 text-ink-200" />
          </div>
          <h1 className="mb-3 text-3xl font-extrabold text-white">Conversion not found</h1>
          <p className="mb-8 text-ink-200">That conversion is not available, but you can choose from all implemented tools.</p>
          <Link href="/tools" className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-bold text-white hover:bg-indigo-400">
            <Grid2X2 className="h-4 w-4" /> Browse conversion tools
          </Link>
        </main>
      </div>
    );
  }

  const tool = getToolBySlug(type);
  const hasPdfSettings = conversion.toFormat === "PDF";
  const hasQualitySetting = conversion.category === "images" && ["JPG", "WebP"].includes(conversion.toFormat);

  return (
    <div className="min-h-screen bg-navy-950">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <RecordToolVisit slug={type} />
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: `${conversion.fromFormat} to ${conversion.toFormat}` },
          ]}
          className="mb-6"
        />

        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-400">{conversion.category}</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {conversion.fromFormat} <span className="text-indigo-400">to</span> {conversion.toFormat}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-200">{conversion.description}</p>
          {/* Capabilities are read from the registry rather than asserted in
              copy, so this converter states its own behaviour. */}
          {tool && <CapabilityBadges capabilities={tool.capabilities} className="mt-4" />}
        </div>

        {/* Main conversion area with improved layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left side - Upload area (2 columns) */}
          <div className="space-y-4 lg:col-span-2">
            <section className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]" aria-label="File conversion">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <h2 className="text-lg font-extrabold text-white">{conversion.from} <span className="mx-1 text-indigo-400">→</span> {conversion.to}</h2>
            </div>

              {!file ? (
                <div className="p-6">
                  <div
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all sm:p-12 ${
                      isDragging
                        ? "border-indigo-400 bg-indigo-500/10"
                        : "border-white/10 bg-white/[0.01] hover:border-indigo-400/40 hover:bg-white/[0.03]"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={(event) => event.preventDefault()}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    aria-label={`Choose a ${conversion.fromFormat} file. Accepted: ${conversion.acceptedExtensions.join(", ")}. Maximum ${FILE_LIMIT_MB} megabytes.`}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10">
                      <UploadCloud className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-white">Drop your {conversion.fromFormat} file here</h3>
                    <p className="mb-4 text-sm text-ink-200">or click to browse — accepted: {conversion.acceptedExtensions.join(", ")}</p>
                    <p className="text-xs text-slate-400">Maximum file size: {FILE_LIMIT_MB} MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    tabIndex={-1}
                    aria-hidden="true"
                    accept={conversion.acceptedExtensions.join(",")}
                    className="hidden"
                    onChange={(event) => event.target.files?.[0] && void handleFile(event.target.files[0])}
                  />
                </div>
              ) : convertedUrl ? (
                <div className="p-6">
                  <div className="mb-4 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-indigo-500/5 p-6 text-center" role="status">
                    <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-indigo-400" />
                    <h3 className="mb-1 text-lg font-bold text-white">Conversion complete</h3>
                    <p className="break-words text-sm text-ink-200">
                      {file.name} → <span className="font-medium text-indigo-300">{convertedName}</span>
                    </p>
                  </div>
                  <a href={convertedUrl} download={convertedName} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40">
                    <Download className="h-4 w-4" /> Download {conversion.toFormat}
                  </a>
                  <button type="button" onClick={reset} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-ink-100 hover:bg-white/10">
                    <RotateCcw className="h-4 w-4" /> Convert another file
                  </button>
                </div>
              ) : (
                <div className="space-y-5 p-6">
                  <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                    <FileType className="h-5 w-5 shrink-0 text-indigo-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                      <p className="text-xs text-ink-200">{file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1024 / 1024).toFixed(2)} MB`}</p>
                    </div>
                    <button type="button" onClick={reset} className="rounded-lg p-2 text-ink-200 hover:bg-white/10 hover:text-white" aria-label="Remove selected file">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {previewText && (
                    <div className="overflow-hidden rounded-xl border border-white/5 bg-navy-900">
                      <div className="border-b border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-ink-200">Source preview</div>
                      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-ink-100">{previewText}</pre>
                    </div>
                  )}
                  {isConverting && (
                    <div className="flex items-center gap-3 text-sm text-indigo-300" role="status" aria-live="polite">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" />
                      Reading, converting and packaging your file…
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mx-6 mb-6 rounded-lg border border-coral-500/20 bg-coral-500/10 px-4 py-3 text-sm text-coral-400" role="alert">
                  <p>{error}</p>
                  {!file && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 font-semibold underline underline-offset-2 hover:text-rose-300">Choose another file</button>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Right side - Settings, Switcher, and Related (1 column) */}
          <aside className="space-y-6 lg:col-span-1">
            {/* Conversion settings */}
            <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
                <Settings className="h-4 w-4 text-indigo-400" /> Conversion settings
              </h2>
              {hasPdfSettings ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-ink-200">Page size</span>
                    <select value={pageSize} onChange={(event) => setPageSize(event.target.value)} className="w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50">
                      <option>A4</option><option>Letter</option><option>Auto</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-ink-200">Document font</span>
                    <select value={font} onChange={(event) => setFont(event.target.value)} className="w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50">
                      <option>System</option><option>Serif</option>
                    </select>
                  </label>
                  <p className="text-xs leading-relaxed text-slate-400">PDF pages use consistent margins, line spacing and page-safe text breaks.</p>
                </div>
              ) : hasQualitySetting ? (
                <label className="block">
                  <span className="mb-2 flex justify-between text-xs font-medium text-ink-200"><span>Output quality</span><span>{imageQuality}%</span></span>
                  <input type="range" min="60" max="100" step="1" value={imageQuality} onChange={(event) => setImageQuality(Number(event.target.value))} className="w-full accent-indigo-500" />
                </label>
              ) : (
                <p className="text-sm leading-relaxed text-ink-200">No settings are required for this conversion. The source structure is preserved where the output format supports it.</p>
              )}

              {!convertedUrl && file && (
                <button
                  type="button"
                  onClick={() => void handleConvert()}
                  disabled={isConverting}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isConverting ? "Converting…" : `Convert to ${conversion.toFormat}`}
                </button>
              )}
            </section>

            {/* Compact Switch tool panel (moved from above uploader) */}
            <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6" aria-labelledby="conversion-picker-title">
              <div className="mb-4">
                <h2 id="conversion-picker-title" className="font-bold text-white flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-indigo-400" /> Switch tool
                </h2>
                <p className="mt-1 text-xs text-ink-200">Convert other formats quickly</p>
              </div>
              
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-ink-200">Convert from</span>
                  <select
                    value={conversion.fromFormat}
                    onChange={(event) => handleSourceChange(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-navy-900 px-3 py-2.5 text-sm font-semibold text-white outline-none transition-colors focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20"
                  >
                    {sourceFormats.map((format) => <option key={format}>{format}</option>)}
                  </select>
                </label>
                
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-ink-200">Convert to</span>
                  <select
                    value={type}
                    onChange={(event) => goToTool(event.target.value as ConversionType)}
                    className="w-full rounded-xl border border-white/10 bg-navy-900 px-3 py-2.5 text-sm font-semibold text-white outline-none transition-colors focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20"
                  >
                    {sourceTools.map(([key, item]) => <option key={key} value={key}>{item.toFormat}</option>)}
                  </select>
                </label>
                
                {reverseTool && (
                  <button
                    type="button"
                    onClick={() => goToTool(reverseTool[0])}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-ink-100 hover:border-indigo-400/30 hover:bg-white/10"
                    title={`Switch to ${reverseTool[1].fromFormat} to ${reverseTool[1].toFormat}`}
                  >
                    <ArrowRightLeft className="h-4 w-4" /> Swap directions
                  </button>
                )}
              </div>
            </section>

            {/* Related conversions */}
            <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-bold text-white">Related conversions</h2>
                <Link href={`/tools?category=${conversion.category}`} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">See all</Link>
              </div>
              <div className="space-y-2">
                {relatedTools.map(([key, item]) => (
                  <Link key={key} href={`/conversion/${key}`} className="group flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-sm text-ink-200 hover:border-indigo-400/20 hover:bg-white/5 hover:text-white">
                    <span>{item.fromFormat} → {item.toFormat}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-400" />
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
