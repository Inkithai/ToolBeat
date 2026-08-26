"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, Download, Trash2, GripVertical } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultUrlRef = useRef("");

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const pdfs = Array.from(newFiles).filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (pdfs.length === 0) {
      setError("Please select PDF files only.");
      return;
    }
    setFiles(prev => [...prev, ...pdfs]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (from: number, to: number) => {
    setFiles(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const merge = async () => {
    if (files.length < 2) {
      setError("Add at least 2 PDF files to merge.");
      return;
    }
    setIsMerging(true);
    setError("");

    try {
      const { jsPDF } = await import("jspdf");
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib.version as string)}/pdf.worker.min.mjs`;

      // Collect all rendered page images first
      const pageImages: { data: string; width: number; height: number }[] = [];

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1 });
          const scale = 2;
          const scaledViewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;

          await page.render({ canvas, viewport: scaledViewport }).promise;

          const imgData = canvas.toDataURL("image/jpeg", 0.92);
          pageImages.push({
            data: imgData,
            width: viewport.width,
            height: viewport.height,
          });
        }
      }

      if (pageImages.length === 0) {
        setError("No pages found in the PDF files.");
        setIsMerging(false);
        return;
      }

      // Create the merged PDF with the first page's dimensions
      const firstPage = pageImages[0];
      const mergedPdf = new jsPDF({ unit: "pt", format: [firstPage.width, firstPage.height] });

      // Add first page
      const pageWidth = firstPage.width;
      const pageHeight = firstPage.height;
      mergedPdf.addImage(firstPage.data, "JPEG", 0, 0, pageWidth, pageHeight);

      // Add remaining pages
      for (let i = 1; i < pageImages.length; i++) {
        const pg = pageImages[i];
        mergedPdf.addPage([pg.width, pg.height]);
        mergedPdf.addImage(pg.data, "JPEG", 0, 0, pg.width, pg.height);
      }

      if (resultUrlRef.current.startsWith("blob:")) URL.revokeObjectURL(resultUrlRef.current);
      const blob = mergedPdf.output("blob");
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResultUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Merge failed. Check the PDF files.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <IoWorkspace
      inputLabel="PDF files"
      outputLabel="Merged PDF"
      status={resultUrl ? "complete" : error ? "error" : "idle"}
      footer={
        error ? (
          <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
            {error}
          </p>
        ) : undefined
      }
      input={
        <div className="space-y-3">
          <div
            className="rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center transition-colors hover:border-indigo-400/30"
            onDragOver={e => { e.preventDefault(); }}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            <UploadCloud className="mx-auto mb-2 h-8 w-8 text-ink-500" />
            <p className="text-sm text-ink-400">Drop PDF files here or</p>
            <label className="mt-2 inline-block cursor-pointer rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-200 hover:text-white">
              Browse files
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
            </label>
          </div>
          {files.length > 0 && (
            <div className="max-h-48 overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.02]">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-2 border-b border-white/[0.04] px-3 py-2">
                  <GripVertical className="h-3 w-3 text-ink-600" />
                  <span className="flex-1 truncate text-xs text-ink-300">{file.name}</span>
                  <span className="text-[10px] text-ink-500">{(file.size / 1024).toFixed(0)} KB</span>
                  {i > 0 && <button type="button" onClick={() => moveFile(i, i - 1)} className="text-[10px] text-ink-500 hover:text-white">↑</button>}
                  {i < files.length - 1 && <button type="button" onClick={() => moveFile(i, i + 1)} className="text-[10px] text-ink-500 hover:text-white">↓</button>}
                  <button type="button" onClick={() => removeFile(i)} className="text-ink-600 hover:text-rose-300">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={merge} disabled={files.length < 2 || isMerging} className="btn-primary w-full">
            <Download className="mr-2 inline h-4 w-4" />
            {isMerging ? "Merging..." : `Merge ${files.length} PDFs`}
          </button>
        </div>
      }
      output={
        resultUrl ? (
          <div className="space-y-3">
            <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/5">
              <div className="text-center">
                <p className="text-lg font-bold text-white">PDF Merged ✓</p>
                <p className="mt-1 text-sm text-ink-400">{files.length} files combined</p>
              </div>
            </div>
            <a href={resultUrl} download="merged.pdf" className="btn-primary block w-full text-center">
              <Download className="mr-2 inline h-4 w-4" /> Download Merged PDF
            </a>
          </div>
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 text-sm text-ink-600">
            Add at least 2 PDFs and click Merge
          </div>
        )
      }
    />
  );
}
