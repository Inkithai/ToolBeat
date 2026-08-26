"use client";

import { useCallback } from "react";
import TextTransform from "@/components/tools/text-transform";
import { validateXml } from "@/lib/tools/validate-xml";
import { usePersistentState } from "@/lib/storage/preferences";

type XmlPreferences = { allowBooleanAttributes: boolean; unpairedTags: string };

const DEFAULTS: XmlPreferences = { allowBooleanAttributes: false, unpairedTags: "" };

export default function XmlValidatorClient() {
  const [prefs, setPrefs] = usePersistentState<XmlPreferences>("convertlab:xml-validator", DEFAULTS);

  const transform = useCallback(
    (input: string) => {
      const unpaired = prefs.unpairedTags
        .split(/[\s,]+/)
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
      const result = validateXml(input, {
        allowBooleanAttributes: prefs.allowBooleanAttributes,
        unpairedTags: unpaired,
      });
      if (!result.valid) {
        const issue = result.issues[0];
        const where = issue?.line ? ` (line ${issue.line}${issue.column ? `, column ${issue.column}` : ""})` : "";
        throw new Error(`${issue?.message ?? "The document is not well-formed."}${where}`);
      }
      return "Valid XML ✓ — the document is well-formed.";
    },
    [prefs],
  );

  return (
    <TextTransform
      inputLabel="XML"
      outputLabel="Result"
      live
      outputKind="code"
      placeholder={`<?xml version="1.0"?>\n<root>\n  <item>1</item>\n</root>`}
      transform={transform}
      options={
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-200">
            <input
              type="checkbox"
              checked={prefs.allowBooleanAttributes}
              onChange={(event) => setPrefs({ allowBooleanAttributes: event.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-navy-900 accent-indigo-500"
            />
            Allow boolean attributes
          </label>
          <label className="block text-xs text-ink-200">
            Unpaired tags
            <input
              type="text"
              value={prefs.unpairedTags}
              onChange={(event) => setPrefs({ unpairedTags: event.target.value })}
              placeholder="br, img, hr"
              className="field mt-1 w-36 text-xs"
            />
          </label>
        </div>
      }
    />
  );
}
