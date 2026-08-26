"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, Download, Scissors } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"all" | "range" | "each">("all");
  const [ranges, setRanges] = useState("1-3");
  const [isSplitting, setIsSplitting] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultUrlRef = useRef("");

  const handleFile = useCallback(async (f: File | null) => {
    if (!f) return;
    setError("");
    setResultUrl("");
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }
    setFile(f);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib.version as string)}/pdf.worker.min.mjs`;
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
    } catch {
      setError("Could not read this PDF. The file may be corrupted.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  async function renderPageToImage(page: import("pdfjs-dist").PDFPageProxy, scale: number): Promise<{ data: string; width: number; height: number }> {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvas, viewport }).promise;
    return {
      data: canvas.toDataURL("image/jpeg", 0.92),
      width: viewport.width / scale,
      height: viewport.height / scale,
    };
  }

  const split = async () => {
    if (!file) return;
    setIsSplitting(true);
    setError("");

    try {
      const { jsPDF } = await import("jspdf");
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib.version as string)}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      if (mode === "each") {
        // Extract each page as separate PDF and ZIP them
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const rendered = await renderPageToImage(page, 2);

          const singlePage = new jsPDF({ unit: "pt", format: [rendered.width, rendered.height] });
          singlePage.addImage(rendered.data, "JPEG", 0, 0, rendered.width, rendered.height);
          zip.file(`page-${pageNum}.pdf`, singlePage.output("blob"));
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        if (resultUrlRef.current.startsWith("blob:")) URL.revokeObjectURL(resultUrlRef.current);
        const url = URL.createObjectURL(zipBlob);
        resultUrlRef.current = url;
        setResultUrl(url);
        setResultName(`${file.name.replace(".pdf", "")}-pages.zip`);
        setIsSplitting(false);
        return;
      }

      let pagesToExtract: number[] = [];

      if (mode === "all") {
        pagesToExtract = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
      } else {
        // Parse ranges like "1-3,5,7-9"
        const parts = ranges.split(",").map(s => s.trim()).filter(Boolean);
        for (const part of parts) {
          if (part.includes("-")) {
            const [start, end] = part.split("-").map(Number);
            if (start && end) {
              for (let i = start; i <= end; i++) {
                if (i >= 1 && i <= pdf.numPages) pagesToExtract.push(i);
              }
            }
          } else {
            const num = parseInt(part);
            if (num >= 1 && num <= pdf.numPages) pagesToExtract.push(num);
          }
        }
      }

      if (pagesToExtract.length === 0) {
        setError("No valid pages selected.");
        setIsSplitting(false);
        return;
      }

      // Render first page to get dimensions
      const firstPage = await pdf.getPage(pagesToExtract[0]);
      const firstRendered = await renderPageToImage(firstPage, 2);

      const outputPdf = new jsPDF({ unit: "pt", format: [firstRendered.width, firstRendered.height] });
      outputPdf.addImage(firstRendered.data, "JPEG", 0, 0, firstRendered.width, firstRendered.height);

      for (let i = 1; i < pagesToExtract.length; i++) {
        const page = await pdf.getPage(pagesToExtract[i]);
        const rendered = await renderPageToImage(page, 2);
        outputPdf.addPage([rendered.width, rendered.height]);
        outputPdf.addImage(rendered.data, "JPEG", 0, 0, rendered.width, rendered.height);
      }

      if (resultUrlRef.current.startsWith("blob:")) URL.revokeObjectURL(resultUrlRef.current);
      const blob = outputPdf.output("blob");
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResultUrl(url);
      setResultName(`${file.name.replace(".pdf", "")}-split.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Split failed.");
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <IoWorkspace
      inputLabel="PDF file"
      outputLabel="Split result"
      status={resultUrl ? "complete" : error ? "error" : "idle"}
      footer={error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">{error}</p> : undefined}
      input={
        <div className="space-y-3">
          <div
            className="rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          >
            <UploadCloud className="mx-auto mb-2 h-8 w-8 text-ink-500" />
            <p className="text-sm text-ink-400">Drop a PDF here or</p>
            <label className="mt-2 inline-block cursor-pointer rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-200 hover:text-white">
              Browse
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          {file && (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-ink-300">
              <span className="font-semibold text-white">{file.name}</span> · {pageCount} pages
            </div>
          )}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-ink-300">
              <input type="radio" name="splitMode" value="all" checked={mode === "all"} onChange={() => setMode("all")} className="accent-indigo-500" />
              Extract all pages (re-render)
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-300">
              <input type="radio" name="splitMode" value="range" checked={mode === "range"} onChange={() => setMode("range")} className="accent-indigo-500" />
              Extract specific pages
            </label>
            {mode === "range" && (
              <input type="text" value={ranges} onChange={e => setRanges(e.target.value)} placeholder="e.g. 1-3, 5, 7-9" className="field w-full text-xs" />
            )}
            <label className="flex items-center gap-2 text-xs text-ink-300">
              <input type="radio" name="splitMode" value="each" checked={mode === "each"} onChange={() => setMode("each")} className="accent-indigo-500" />
              Split each page into its own PDF (ZIP)
            </label>
          </div>
          <button type="button" onClick={split} disabled={!file || isSplitting} className="btn-primary w-full">
            <Scissors className="mr-2 inline h-4 w-4" />
            {isSplitting ? "Splitting..." : "Split PDF"}
          </button>
        </div>
      }
      output={
        resultUrl ? (
          <div className="space-y-3">
            <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/5">
              <div className="text-center">
                <p className="text-lg font-bold text-white">Split Complete ✓</p>
                <p className="mt-1 text-sm text-ink-400">{resultName}</p>
              </div>
            </div>
            <a href={resultUrl} download={resultName} className="btn-primary block w-full text-center">
              <Download className="mr-2 inline h-4 w-4" /> Download
            </a>
          </div>
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 text-sm text-ink-600">
            Upload a PDF and choose how to split it
          </div>
        )
      }
    />
  );
}
