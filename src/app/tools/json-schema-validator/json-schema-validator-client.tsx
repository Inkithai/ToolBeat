"use client";

import { useEffect, useMemo, useState } from "react";
import { validateJsonAgainstSchema, type SchemaValidation } from "@/lib/tools/validate-json-schema";

const SAMPLE_SCHEMA = `{
  "type": "object",
  "properties": {
    "name": { "type": "string", "minLength": 2 },
    "age": { "type": "integer", "minimum": 0 },
    "site": { "type": "string", "format": "uri" }
  },
  "required": ["name"],
  "additionalProperties": false
}`;

const SAMPLE_DOC = `{
  "name": "ConvertLab",
  "age": 3,
  "site": "https://convertlab.example"
}`;

export default function JsonSchemaValidatorClient() {
  const [document, setDocument] = useState(SAMPLE_DOC);
  const [schema, setSchema] = useState(SAMPLE_SCHEMA);
  const [result, setResult] = useState<SchemaValidation | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    // Small debounce so pasting a large schema doesn't thrash ajv.
    const timer = window.setTimeout(() => {
      validateJsonAgainstSchema(document, schema).then((value) => {
        if (!cancelled) {
          setResult(value);
          setBusy(false);
        }
      });
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [document, schema]);

  const errorList = useMemo(() => result?.errors ?? [], [result]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">JSON document</span>
          <textarea
            value={document}
            onChange={(event) => setDocument(event.target.value)}
            rows={12}
            spellCheck={false}
            className="field w-full resize-y font-mono text-sm"
            placeholder="{ &quot;name&quot;: &quot;…&quot; }"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">JSON Schema</span>
          <textarea
            value={schema}
            onChange={(event) => setSchema(event.target.value)}
            rows={12}
            spellCheck={false}
            className="field w-full resize-y font-mono text-sm"
            placeholder="{ &quot;type&quot;: &quot;object&quot; }"
          />
        </label>
      </div>

      <div
        className={`rounded-xl border p-4 ${
          !result
            ? "border-white/10 bg-white/[0.02] text-sm text-ink-500"
            : result.schemaError
              ? "border-amber-400/20 bg-amber-500/10"
              : result.documentError
                ? "border-amber-400/20 bg-amber-500/10"
                : result.valid
                  ? "border-emerald-400/20 bg-emerald-500/10"
                  : "border-rose-400/20 bg-rose-500/10"
        }`}
        role="status"
      >
        {busy && !result ? (
          <p className="text-sm text-ink-500">Checking…</p>
        ) : !result ? null : result.schemaError ? (
          <p className="text-sm text-amber-200">{result.schemaError}</p>
        ) : result.documentError ? (
          <p className="text-sm text-amber-200">{result.documentError}</p>
        ) : result.valid ? (
          <p className="text-sm font-semibold text-emerald-300">Valid — the document satisfies the schema ✓</p>
        ) : (
          <div>
            <p className="text-sm font-semibold text-rose-300">
              {errorList.length} validation failure{errorList.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-rose-200">
              {errorList.map((error, index) => (
                <li key={`${error}-${index}`}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
