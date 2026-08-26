"use client";

import { useCallback } from "react";
import TextTransform from "@/components/tools/text-transform";
import { validateYaml } from "@/lib/tools/validate-yaml";

export default function YamlValidatorClient() {
  const transform = useCallback((input: string) => {
    const result = validateYaml(input);
    if (!result.valid) {
      const issue = result.issues[0];
      const where = issue?.line ? ` (line ${issue.line}${issue.column ? `, column ${issue.column}` : ""})` : "";
      throw new Error(`${issue?.message ?? "The YAML is not valid."}${where}`);
    }
    const docs = result.documentCount > 1 ? ` (${result.documentCount} documents)` : "";
    return `Valid YAML ✓${docs}`;
  }, []);

  return (
    <TextTransform
      inputLabel="YAML"
      outputLabel="Result"
      live
      outputKind="code"
      placeholder={`name: ConvertLab\ntools:\n  - minifier\n  - validator`}
      transform={transform}
    />
  );
}
