/**
 * YAML validation via js-yaml. Validates every document in a stream and
 * reports the first parse error with its line and column.
 */

import { loadAll } from "js-yaml";

export type YamlIssue = {
  message: string;
  line?: number;
  column?: number;
};

export type YamlValidation = {
  valid: boolean;
  issues: YamlIssue[];
  /** Number of documents in the stream (multi-document YAML is legal). */
  documentCount: number;
};

function issueFrom(error: unknown): YamlIssue {
  if (
    error &&
    typeof error === "object" &&
    "reason" in error &&
    "mark" in error
  ) {
    const marked = error as { reason?: string; mark: { line?: number; column?: number } };
    return {
      message: marked.reason ?? "The YAML is not valid.",
      line: typeof marked.mark.line === "number" ? marked.mark.line + 1 : undefined,
      column: typeof marked.mark.column === "number" ? marked.mark.column + 1 : undefined,
    };
  }
  return { message: error instanceof Error ? error.message : "The YAML is not valid." };
}

export function validateYaml(text: string): YamlValidation {
  if (!text.trim()) {
    return {
      valid: false,
      issues: [{ message: "Nothing to validate — the input is empty." }],
      documentCount: 0,
    };
  }
  try {
    const documents = loadAll(text);
    return { valid: true, issues: [], documentCount: documents.length };
  } catch (error) {
    return { valid: false, issues: [issueFrom(error)], documentCount: 0 };
  }
}
