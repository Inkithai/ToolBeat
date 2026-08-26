/**
 * Line-level text transformations: sort (plain or natural/numeric), dedupe,
 * blank-line removal, trimming.
 */

export type LineSortMode = "none" | "asc" | "desc" | "natural-asc" | "natural-desc";

export type LineOptions = {
  sort: LineSortMode;
  caseInsensitive?: boolean;
  /** Trim leading/trailing whitespace from each line. */
  trim?: boolean;
  /** Drop lines that are empty (after trimming). */
  removeBlank?: boolean;
  /** Keep only the first occurrence of each line (after sorting/trimming). */
  dedupe?: boolean;
};

export function transformLines(input: string, options: Partial<LineOptions> = {}): string[] {
  const { sort = "none", caseInsensitive = true, trim = false, removeBlank = false, dedupe = false } = options;

  let lines = input.split(/\r?\n/);
  // A trailing newline should not create a phantom final line.
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  if (trim) lines = lines.map((line) => line.trim());
  if (removeBlank) lines = lines.filter((line) => line.trim() !== "");

  if (sort !== "none") {
    const natural = sort.startsWith("natural");
    const descending = sort.endsWith("desc");
    lines = [...lines].sort((a, b) => {
      let result: number;
      if (natural) {
        result = a.localeCompare(b, undefined, {
          numeric: true,
          sensitivity: caseInsensitive ? "base" : "variant",
        });
      } else {
        result = caseInsensitive
          ? a.toLowerCase().localeCompare(b.toLowerCase())
          : a.localeCompare(b);
      }
      return descending ? -result : result;
    });
  }

  if (dedupe) {
    const seen = new Set<string>();
    lines = lines.filter((line) => {
      const key = caseInsensitive ? line.toLowerCase() : line;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return lines;
}
