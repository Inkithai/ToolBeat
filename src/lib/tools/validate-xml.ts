/**
 * XML well-formedness validation using fast-xml-parser's validator, which
 * reports the first structural error with its line and column.
 */

import { XMLValidator } from "fast-xml-parser";

export type XmlIssue = {
  message: string;
  line?: number;
  column?: number;
};

export type XmlValidation = {
  valid: boolean;
  issues: XmlIssue[];
};

export type XmlValidateOptions = {
  /** Allow attributes without values, e.g. `<a x/>`. */
  allowBooleanAttributes?: boolean;
  /** Tags that are always closed by themselves, e.g. ["br"]. */
  unpairedTags?: string[];
};

export function validateXml(
  xml: string,
  options: XmlValidateOptions = {},
): XmlValidation {
  const trimmed = xml.trim();
  if (!trimmed) {
    return { valid: false, issues: [{ message: "Nothing to validate — the input is empty." }] };
  }
  const result = XMLValidator.validate(trimmed, {
    allowBooleanAttributes: options.allowBooleanAttributes ?? false,
    unpairedTags: options.unpairedTags ?? [],
  });
  if (result === true) return { valid: true, issues: [] };
  const err = result.err ?? {};
  const issue: XmlIssue = {
    message: err.msg ?? "The document is not well-formed.",
    line: typeof err.line === "number" ? err.line : undefined,
    column: typeof err.col === "number" ? err.col : undefined,
  };
  return { valid: false, issues: [issue] };
}
