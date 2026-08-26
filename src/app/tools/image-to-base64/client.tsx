"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [base64, setBase64] = useState("");
  const [dataUri, setDataUri] = useState("");
  const [fileInfo, setFileInfo] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [outputMode, setOutputMode] = useState<"datauri" | "raw">("datauri");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("Please select an image file."); return; }
    setError("");

    setFileInfo(`${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDataUri(result);
      const commaIndex = result.indexOf(",");
      setBase64(result.substring(commaIndex + 1));
    };
    reader.onerror = () => setError("Failed to read the file.");
    reader.readAsDataURL(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const output = outputMode === "datauri" ? dataUri : base64;

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(outputMode);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <IoWorkspace
      inputLabel="Image"
      outputLabel="Base64 output"
      status={output ? "complete" : error ? "error" : "idle"}
      outputAction={
        output ? (
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        ) : undefined
      }
      footer={error ? <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">{error}</p> : undefined}
      input={
        <div className="space-y-3">
          <div
            className="rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          >
            <UploadCloud className="mx-auto mb-2 h-8 w-8 text-ink-500" />
            <p className="text-sm text-ink-400">Drop an image here or</p>
            <label className="mt-2 inline-block cursor-pointer rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-200 hover:text-white">
              Browse
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOutputMode("datauri")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${outputMode === "datauri" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400 hover:text-white"}`}
            >
              Data URI
            </button>
            <button
              type="button"
              onClick={() => setOutputMode("raw")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${outputMode === "raw" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400 hover:text-white"}`}
            >
              Raw Base64
            </button>
          </div>
          {fileInfo && <p className="text-xs text-ink-500">{fileInfo}</p>}
        </div>
      }
      output={
        output ? (
          <pre className="field min-h-[10rem] overflow-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-cyan-300">
            {output}
          </pre>
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            Upload an image to get its Base64 encoding
          </div>
        )
      }
    />
  );
}
