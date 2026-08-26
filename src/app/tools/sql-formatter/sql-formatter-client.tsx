"use client";

import { useCallback } from "react";
import { usePersistentState } from "@/lib/storage/preferences";
import { SQL_LANGUAGES, formatSql, sqlLanguageLabel, type SqlLanguage } from "@/lib/tools/sql-format";
import TextTransform from "@/components/tools/text-transform";

type SqlFormatterPreferences = {
  language: SqlLanguage;
  useTabs: boolean;
  uppercase: boolean;
};

const DEFAULTS: SqlFormatterPreferences = { language: "sql", useTabs: false, uppercase: false };

export default function SqlFormatterClient() {
  const [preferences, updatePreferences] = usePersistentState<SqlFormatterPreferences>(
    "sql-formatter",
    DEFAULTS,
  );

  const transform = useCallback(
    (input: string) =>
      formatSql(input, {
        language: preferences.language,
        useTabs: preferences.useTabs,
        uppercase: preferences.uppercase,
      }),
    [preferences.language, preferences.useTabs, preferences.uppercase],
  );

  return (
    <TextTransform
      inputLabel="SQL"
      outputLabel="Formatted SQL"
      outputKind="code"
      placeholder="select id, name from users where active = true"
      transform={transform}
      options={
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-200">
            Dialect
            <select
              value={preferences.language}
              onChange={(event) => updatePreferences({ language: event.target.value as SqlLanguage })}
              className="field py-1.5 text-xs"
            >
              {SQL_LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {sqlLanguageLabel(language)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-200">
            <input
              type="checkbox"
              checked={preferences.uppercase}
              onChange={(event) => updatePreferences({ uppercase: event.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
            />
            Uppercase keywords
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-200">
            <input
              type="checkbox"
              checked={preferences.useTabs}
              onChange={(event) => updatePreferences({ useTabs: event.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
            />
            Tab indent
          </label>
        </div>
      }
    />
  );
}
