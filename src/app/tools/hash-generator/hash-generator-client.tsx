"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, FileUp, Trash2 } from "lucide-react";
import { hashAll, type HashResult } from "@/lib/tools/hash";
import IoWorkspace from "@/components/tools/io-workspace";

const ALGO_LABEL: Record<string, string> = {
  MD5: "128-bit",
  "SHA-1": "160-bit",
  "SHA-256": "256-bit",
  "SHA-384": "384-bit",
  "SHA-512": "512-bit",
};

export default function HashGeneratorClient() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [results, setResults] = useState<HashResult[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setFileName(file.name);
    setText("");
    try {
      setFileBytes(new Uint8Array(await file.arrayBuffer()));
    } catch {
      setFileBytes(null);
      setError("The file could not be read.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const compute = async () => {
      if (fileBytes) {
        if (cancelled) return;
        try {
          const hashed = await hashAll(fileBytes);
          if (!cancelled) {
            setResults(hashed);
            setError("");
          }
        } catch (caught) {
          if (!cancelled) setError(caught instanceof Error ? caught.message : "Hashing failed.");
        }
        return;
      }
      if (!text) {
        if (!cancelled) setResults([]);
        return;
      }
      setBusy(true);
      try {
        const hashed = await hashAll(new TextEncoder().encode(text));
        if (!cancelled) {
          setResults(hashed);
          setError("");
        }
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Hashing failed.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    void compute();
    return () => {
      cancelled = true;
    };
  }, [text, fileBytes]);

  const copyAll = async () => {
    const lines = results.map((row) => `${row.algorithm}  ${row.hex}`).join("\n");
    await navigator.clipboard.writeText(lines);
    setCopiedAll(true);
    window.setTimeout(() => setCopiedAll(false), 2000);
  };

  const copyOne = async (row: HashResult) => {
    await navigator.clipboard.writeText(row.hex);
    setCopiedIndex(results.indexOf(row));
    window.setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <IoWorkspace
      inputLabel={fileName ? `File: ${fileName}` : "Input"}
      outputLabel="Digests"
      status={error ? "error" : busy ? "processing" : results.length ? "complete" : "idle"}
      outputAction={
        results.length ? (
          <button
            type="button"
            onClick={() => void copyAll()}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200 transition-colors hover:border-indigo-400/30 hover:text-white"
          >
            {copiedAll ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
            {copiedAll ? "Copied" : "Copy all"}
          </button>
        ) : undefined
      }
      footer={
        error ? (
          <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
            {error}
          </p>
        ) : (
          <p className="mt-3 text-xs text-ink-600">
            Hashed locally in your browser with WebCrypto (MD5 is a built-in implementation). Nothing is uploaded.
          </p>
        )
      }
      input={
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (fileBytes) {
                setFileBytes(null);
                setFileName("");
              }
            }}
            placeholder="Text to hash…"
            rows={8}
            spellCheck={false}
            className="field w-full resize-y font-mono text-sm"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3 py-2 text-xs font-semibold text-ink-300 transition-colors hover:border-indigo-400/40 hover:text-white">
            <FileUp className="h-4 w-4" />
            Hash a file instead (≤ 50 MB)
            <input
              type="file"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>
          {(text || fileName) && (
            <button
              type="button"
              onClick={() => {
                setText("");
                setFileBytes(null);
                setFileName("");
                setResults([]);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition-colors hover:text-rose-300"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      }
      output={
        results.length ? (
          <div className="space-y-2">
            {results.map((row, index) => (
              <div
                key={row.algorithm}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <div className="w-24 shrink-0">
                  <p className="text-sm font-bold text-white">{row.algorithm}</p>
                  <p className="text-[11px] text-ink-500">{ALGO_LABEL[row.algorithm]}</p>
                </div>
                <code className="min-w-0 flex-1 break-all font-mono text-xs text-ink-200">{row.hex}</code>
                <button
                  type="button"
                  onClick={() => void copyOne(row)}
                  aria-label={`Copy ${row.algorithm} hex digest`}
                  className="shrink-0 rounded-md border border-white/10 p-1.5 text-ink-400 transition-colors hover:border-indigo-400/30 hover:text-white"
                >
                  {copiedIndex === index ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            Type or choose a file to hash
          </div>
        )
      }
    />
  );
}
