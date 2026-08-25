"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowRightLeft,
  UploadCloud,
  Settings,
  Download,
  RotateCcw,
  FileType,
  Grid2X2,
} from "lucide-react";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import {
  CATEGORIES,
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
import IoWorkspace from "@/components/tools/io-workspace";

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

function formatBytes(size: number): string {
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
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
      <div className="bg-navy-950">
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <FileType className="h-8 w-8 text-ink-300" />
          </div>
          <h1 className="mb-3 text-3xl font-extrabold text-white">Conversion not found</h1>
          <p className="mb-8 text-ink-400">That conversion is not available, but you can choose from all implemented tools.</p>
          <Link href="/tools" className="btn-primary">
            <Grid2X2 className="h-4 w-4" /> Browse conversion tools
          </Link>
        </main>
      </div>
    );
  }

  const tool = getToolBySlug(type);
  const hasPdfSettings = conversion.toFormat === "PDF";
  const hasQualitySetting = conversion.category === "images" && ["JPG", "WebP"].includes(conversion.toFormat);
  const step = !file ? 1 : convertedUrl ? 3 : 2;

  return (
    <div className="relative overflow-hidden bg-navy-950">
      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <RecordToolVisit slug={type} />
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            {
              name: CATEGORIES.find((item) => item.key === conversion.category)?.label ?? conversion.category,
              href: `/tools?category=${conversion.category}`,
            },
            { name: `${conversion.fromFormat} to ${conversion.toFormat}` },
          ]}
          className="mb-6"
        />

        <header className="mb-8 animate-fade-up">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="meta mb-2 text-ink-500">
                {conversion.category} · converter
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {conversion.fromFormat}{" "}
                <span className="text-gradient-aurora">→</span> {conversion.toFormat}
              </h1>
              <p className="mt-3 max-w-2xl text-ink-300">{conversion.description}</p>
              {tool && <CapabilityBadges capabilities={tool.capabilities} className="mt-4" />}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                Accepts {conversion.acceptedExtensions.join(", ")}
              </span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                Up to {FILE_LIMIT_MB} MB
              </span>
            </div>
          </div>

          {/* Progress steps — makes the task flow obvious */}
          <ol className="mt-6 grid gap-2 sm:grid-cols-3" aria-label="Conversion steps">
            {[
              { n: 1, label: "Add file" },
              { n: 2, label: "Convert" },
              { n: 3, label: "Download" },
            ].map((item) => {
              const done = step > item.n;
              const active = step === item.n;
              return (
                <li
                  key={item.n}
                  className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    active
                      ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-100 shadow-[0_0_24px_-10px_rgba(139,92,246,0.7)]"
                      : done
                        ? "border-cyan-400/25 bg-cyan-500/10 text-cyan-100"
                        : "border-white/[0.05] bg-transparent text-ink-500"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                      active
                        ? "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white"
                        : done
                          ? "bg-cyan-500 text-white"
                          : "bg-white/10 text-ink-400"
                    }`}
                  >
                    {done ? "✓" : item.n}
                  </span>
                  {item.label}
                </li>
              );
            })}
          </ol>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <IoWorkspace
              inputLabel={conversion.fromFormat}
              outputLabel={conversion.toFormat}
              status={isConverting ? "processing" : convertedUrl ? "complete" : error ? "error" : "idle"}
              input={
                <div>
                  <div
                    className={`cursor-pointer border border-dashed p-6 text-center motion-fn ${
                      isDragging ? "border-cyan-400 bg-cyan-500/10" : "border-white/15 hover:border-indigo-400/40"
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
                    <UploadCloud className="mx-auto mb-3 h-6 w-6 text-indigo-300" />
                    <p className="text-sm font-semibold text-white">
                      {file ? file.name : `Drop ${conversion.fromFormat} here`}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      {file ? formatBytes(file.size) : `${conversion.acceptedExtensions.join(", ")} · max ${FILE_LIMIT_MB} MB`}
                    </p>
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
                  {file && previewText && (
                    <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-words border border-white/10 p-3 font-mono text-xs text-ink-300">
                      {previewText}
                    </pre>
                  )}
                  {file && (
                    <button type="button" onClick={reset} className="mt-2 text-xs font-semibold text-ink-400 hover:text-white">
                      Remove file
                    </button>
                  )}
                </div>
              }
              output={
                convertedUrl ? (
                  <div role="status">
                    <p className="meta text-cyan-400">Complete in your browser</p>
                    <p className="mt-2 break-words text-sm text-ink-200">{convertedName}</p>
                    <a href={convertedUrl} download={convertedName} className="btn-primary mt-4">
                      <Download className="h-4 w-4" /> Download {conversion.toFormat}
                    </a>
                    <button type="button" onClick={reset} className="btn-secondary mt-2">
                      <RotateCcw className="h-4 w-4" /> Convert another
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-ink-500">
                    {isConverting ? "Processing locally…" : `${conversion.toFormat} appears here after conversion.`}
                  </p>
                )
              }
              process={
                file && !convertedUrl ? (
                  <button
                    type="button"
                    onClick={() => void handleConvert()}
                    disabled={isConverting}
                    className="btn-primary disabled:cursor-wait disabled:opacity-60"
                  >
                    {isConverting ? "Converting…" : `Convert to ${conversion.toFormat}`}
                  </button>
                ) : null
              }
              footer={
                error ? (
                  <p role="alert" className="mt-4 text-sm text-rose-300">
                    {error}
                  </p>
                ) : null
              }
            />
          </div>

          {/* Side rail: settings + switch + related */}
          <aside className="space-y-4 lg:col-span-1">
            <section className="surface p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                <Settings className="h-4 w-4 text-indigo-400" /> Settings
              </h2>
              {hasPdfSettings ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-ink-400">Page size</span>
                    <select value={pageSize} onChange={(event) => setPageSize(event.target.value)} className="field">
                      <option>A4</option>
                      <option>Letter</option>
                      <option>Auto</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-ink-400">Document font</span>
                    <select value={font} onChange={(event) => setFont(event.target.value)} className="field">
                      <option>System</option>
                      <option>Serif</option>
                    </select>
                  </label>
                  <p className="text-xs leading-relaxed text-ink-500">
                    PDF pages use consistent margins, line spacing and page-safe text breaks.
                  </p>
                </div>
              ) : hasQualitySetting ? (
                <label className="block">
                  <span className="mb-2 flex justify-between text-xs font-medium text-ink-400">
                    <span>Output quality</span>
                    <span>{imageQuality}%</span>
                  </span>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    step="1"
                    value={imageQuality}
                    onChange={(event) => setImageQuality(Number(event.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </label>
              ) : (
                <p className="text-sm leading-relaxed text-ink-400">
                  No settings are required for this conversion. Source structure is preserved where the output format supports it.
                </p>
              )}

              {!convertedUrl && file && (
                <button
                  type="button"
                  onClick={() => void handleConvert()}
                  disabled={isConverting}
                  className="btn-primary mt-5 w-full py-3.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isConverting ? "Converting…" : `Convert to ${conversion.toFormat}`}
                </button>
              )}
            </section>

            <section className="surface p-5" aria-labelledby="conversion-picker-title">
              <div className="mb-4">
                <h2 id="conversion-picker-title" className="flex items-center gap-2 text-sm font-bold text-white">
                  <ArrowRightLeft className="h-4 w-4 text-indigo-400" /> Switch tool
                </h2>
                <p className="mt-1 text-xs text-ink-500">Change formats without leaving the task</p>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-ink-400">From</span>
                  <select
                    value={conversion.fromFormat}
                    onChange={(event) => handleSourceChange(event.target.value)}
                    className="field font-semibold"
                  >
                    {sourceFormats.map((format) => (
                      <option key={format}>{format}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-ink-400">To</span>
                  <select
                    value={type}
                    onChange={(event) => goToTool(event.target.value as ConversionType)}
                    className="field font-semibold"
                  >
                    {sourceTools.map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.toFormat}
                      </option>
                    ))}
                  </select>
                </label>

                {reverseTool && (
                  <button
                    type="button"
                    onClick={() => goToTool(reverseTool[0])}
                    className="btn-secondary w-full py-2.5 text-sm"
                    title={`Switch to ${reverseTool[1].fromFormat} to ${reverseTool[1].toFormat}`}
                  >
                    <ArrowRightLeft className="h-4 w-4" /> Swap directions
                  </button>
                )}
              </div>
            </section>

            <section className="surface p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-white">Related</h2>
                <Link
                  href={`/tools?category=${conversion.category}`}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  See all
                </Link>
              </div>
              <div className="space-y-1.5">
                {relatedTools.map(([key, item]) => (
                  <Link
                    key={key}
                    href={`/conversion/${key}`}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-transparent px-2.5 py-2 text-sm text-ink-300 transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                  >
                    <span>
                      {item.fromFormat} → {item.toFormat}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-600 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-400" />
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
