/**
 * Find & replace with optional regex mode. Pure string logic — the UI wraps
 * it in a live text tool.
 */

export type FindReplaceOptions = {
  caseSensitive: boolean;
  useRegex: boolean;
};

export type FindReplaceResult = {
  output: string;
  replacements: number;
};

export function findReplace(
  text: string,
  find: string,
  replace: string,
  options: FindReplaceOptions,
): FindReplaceResult {
  if (!find) {
    throw new Error(options.useRegex ? "Enter a pattern to search for." : "Enter text to find.");
  }

  let matcher: RegExp;
  if (options.useRegex) {
    try {
      matcher = new RegExp(find, options.caseSensitive ? "g" : "gi");
    } catch (error) {
      throw new Error(error instanceof SyntaxError ? "That is not a valid regular expression." : "Invalid pattern.");
    }
    if (!matcher.flags.includes("g")) matcher = new RegExp(matcher.source, "g");
  } else {
    const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    matcher = new RegExp(escaped, options.caseSensitive ? "g" : "gi");
  }

  let replacements = 0;
  const output = text.replace(matcher, (...args: Array<string | number>) => {
    const match = String(args[0]);
    replacements += 1;

    if (!options.useRegex) return replace;

    // In regex mode, $1..$9 in the replacement refer to capture groups;
    // $& refers to the whole match. The callback receives
    // (match, ...groups, offset, source) — everything but the last two is a group.
    const groups = args.slice(1, -2).map((value) => (value === undefined ? "" : String(value)));
    return replace.replace(/\$(\d+|&)/g, (token, reference: string) => {
      if (reference === "&") return match;
      const groupIndex = Number(reference);
      if (groupIndex >= 1 && groupIndex <= groups.length) return groups[groupIndex - 1];
      return token;
    });
  });

  return { output, replacements };
}
