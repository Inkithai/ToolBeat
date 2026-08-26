"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";
import { usePersistentState } from "@/lib/storage/preferences";
import {
  generateMockData,
  MOCK_FIELDS,
  mockRowsToCsv,
  mockRowsToJson,
  type MockField,
} from "@/lib/tools/mock-data";

type MockPreferences = {
  fields: MockField[];
  count: number;
  seed: number;
  format: "csv" | "json";
};

const DEFAULTS: MockPreferences = {
  fields: ["name", "email", "company", "city", "amount"],
  count: 10,
  seed: 1,
  format: "csv",
};

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function MockDataGeneratorClient() {
  const [prefs, setPrefs] = usePersistentState<MockPreferences>("convertlab:mock-data", DEFAULTS);

  const result = useMemo(() => {
    try {
      return { data: generateMockData(prefs.count, prefs.fields, prefs.seed), error: "" };
    } catch (caught) {
      return { data: null, error: caught instanceof Error ? caught.message : "Invalid arguments." };
    }
  }, [prefs]);

  const error = result.error;

  const output = useMemo(() => {
    if (!result.data) return "";
    return prefs.format === "csv" ? mockRowsToCsv(result.data) : mockRowsToJson(result.data, false);
  }, [result.data, prefs.format]);

  const toggleField = (field: MockField) => {
    setPrefs({
      fields: prefs.fields.includes(field)
        ? prefs.fields.filter((f) => f !== field)
        : [...prefs.fields, field],
    });
  };

  const fieldClass = "rounded-lg border border-white/10 bg-navy-900 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-400/50";

  return (
    <div className="space-y-4">
      <div>
        <p className="meta mb-2 text-ink-500">Fields</p>
        <div className="flex flex-wrap gap-2">
          {MOCK_FIELDS.map(({ key, label }) => {
            const active = prefs.fields.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleField(key)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  active
                    ? "border-indigo-400/40 bg-indigo-500/20 text-white"
                    : "border-white/10 bg-white/[0.02] text-ink-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Rows</span>
          <input
            type="number"
            min={1}
            max={5000}
            value={prefs.count}
            onChange={(event) => setPrefs({ count: Number(event.target.value) })}
            className={`${fieldClass} w-24`}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Seed</span>
          <input
            type="number"
            value={prefs.seed}
            onChange={(event) => setPrefs({ seed: Number(event.target.value) })}
            className={`${fieldClass} w-24`}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-400">Format</span>
          <select
            value={prefs.format}
            onChange={(event) => setPrefs({ format: event.target.value as "csv" | "json" })}
            className={`${fieldClass} border px-2 py-1.5`}
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </label>
        {output && !error && (
          <button
            type="button"
            onClick={() =>
              download(
                `mock-data-${prefs.seed}.${prefs.format === "csv" ? "csv" : "json"}`,
                output,
                prefs.format === "csv" ? "text/csv" : "application/json",
              )
            }
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/30 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition-colors hover:text-white"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
          {error}
        </p>
      )}

      {result.data && (
        <div className="space-y-2">
          <p className="meta text-ink-500">
            Preview — first {Math.min(6, result.data.rows.length)} of {result.data.rows.length} rows. Same seed and
            fields always produce the same data.
          </p>
          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-ink-400">
                <tr>
                  {result.data.columns.map((column) => (
                    <th key={column} className="px-3 py-2 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.rows.slice(0, 6).map((row, index) => (
                  <tr key={index} className="border-t border-white/[0.04]">
                    {result.data.columns.map((column) => (
                      <td key={column} className="whitespace-nowrap px-3 py-2 font-mono text-ink-200">
                        {row[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
