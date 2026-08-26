"use client";

import { useCallback, useMemo, useState } from "react";
import { findReplace } from "@/lib/tools/find-replace";
import TextTransform from "@/components/tools/text-transform";

export default function FindReplaceClient() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  const transform = useCallback(
    (input: string) => findReplace(input, find, replace, { caseSensitive, useRegex }).output,
    [find, replace, caseSensitive, useRegex],
  );

  const stats = useMemo(() => {
    if (!text.trim() || !find) return null;
    try {
      return findReplace(text, find, replace, { caseSensitive, useRegex }).replacements;
    } catch {
      return null;
    }
  }, [text, find, replace, caseSensitive, useRegex]);

  return (
    <TextTransform
      inputLabel="Text"
      outputLabel="Result"
      live={false}
      placeholder="Paste the text to search through."
      transform={transform}
      onInputChange={setText}
      options={
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-ink-200">
            Find
            <input
              type="text"
              value={find}
              onChange={(event) => setFind(event.target.value)}
              placeholder={useRegex ? "(\\d+) years" : "hello"}
              spellCheck={false}
              className="field mt-1 w-full font-mono text-sm"
            />
          </label>
          <label className="block text-xs text-ink-200">
            Replace with
            <input
              type="text"
              value={replace}
              onChange={(event) => setReplace(event.target.value)}
              placeholder={useRegex ? "$1 yr" : "hi"}
              spellCheck={false}
              className="field mt-1 w-full font-mono text-sm"
            />
          </label>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-xs text-ink-200">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(event) => setCaseSensitive(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
              />
              Match case
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-200">
              <input
                type="checkbox"
                checked={useRegex}
                onChange={(event) => setUseRegex(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
              />
              Use regular expression
            </label>
            {stats !== null && (
              <span className="ml-auto rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                {stats} match{stats === 1 ? "" : "es"}
              </span>
            )}
          </div>
        </div>
      }
    />
  );
}
