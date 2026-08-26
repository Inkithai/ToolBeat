import { describe, expect, it } from "vitest";
import { TOOLS, getToolBySlug } from "./registry";
import { isConversionTool } from "./types";
import { normalizeSearchText, scoreTool, searchTools, tokenizeSearch } from "./search";

/** The tests run against the real registry so they catch catalog drift:
 *  if someone renames a tool or drops a tag these assertions fail loudly
 *  instead of passing against a frozen fixture. */
const names = (query: string) => searchTools(TOOLS, query).map((tool) => tool.name);

describe("normalizeSearchText", () => {
  it("lowercases and flattens separators so slugs and names share a vocabulary", () => {
    expect(normalizeSearchText("JSON-to-CSV_converter/Array")).toBe("json to csv converter array");
  });
});

describe("tokenizeSearch", () => {
  it("drops empty tokens", () => {
    expect(tokenizeSearch("  pdf   to jpg ")).toEqual(["pdf", "to", "jpg"]);
  });
});

describe("searchTools", () => {
  it("returns every tool in registry order for an empty query", () => {
    expect(searchTools(TOOLS, "   ")).toEqual([...TOOLS]);
  });

  it("ranks an exact name match first", () => {
    expect(names("json to yaml")[0]).toBe("JSON to YAML");
  });

  it("matches tokens across different fields, not just one string", () => {
    // No tool contains the literal substring "json csv"; the old single-string
    // substring search returned nothing for this query.
    const results = names("json csv");
    expect(results).toContain("CSV to JSON");
    expect(results).toContain("JSON to CSV");
    expect(results).not.toContain("JSON to YAML");
  });

  it("matches tags that never appear in the name", () => {
    const results = searchTools(TOOLS, "focus");
    expect(results.map((tool) => tool.slug)).toContain("pomodoro");
  });

  it("matches accepted file extensions", () => {
    // "jpeg" appears in the JPG converters' acceptedExtensions (and in the
    // image tools' tags), never as a standalone name — so any hit proves
    // extensions are part of the corpus.
    const results = searchTools(TOOLS, "jpeg");
    expect(results.length).toBeGreaterThanOrEqual(2);
    for (const tool of results) {
      const matchesViaExtension =
        isConversionTool(tool) && tool.conversion.acceptedExtensions.includes(".jpeg");
      const matchesViaTag = tool.tags.includes("jpeg");
      expect(matchesViaExtension || matchesViaTag).toBe(true);
    }
  });

  it("expands aliases without letting them outrank direct matches", () => {
    // "word" directly matches the Word Counter's name; the docx alias must
    // not push a converter above it.
    const results = searchTools(TOOLS, "word");
    expect(results[0]?.slug).toBe("word-counter");
    // …but an aliased two-token query still finds the converter.
    expect(names("word to markdown")).toContain("DOCX to Markdown");
  });

  it("is case- and separator-insensitive", () => {
    expect(names("JSON-to-CSV")).toContain("JSON to CSV");
  });

  it("requires every token to match somewhere (AND semantics)", () => {
    expect(names("pomodoro png")).toEqual([]);
  });

  it("breaks ties deterministically by name", () => {
    // Every converter carries the "convert" tag at the same weight, so this
    // query is a complete tie among them and the only stable order is
    // alphabetical by name. (A utility like Text Case Converter may outrank
    // them via its name — that is scoring working, not a tie.)
    const converters = searchTools(TOOLS, "convert").filter(isConversionTool).map((tool) => tool.name);
    expect(converters).toEqual([...converters].sort((a, b) => a.localeCompare(b)));
  });

  it("keeps the query's top hit useful for a format-family search", () => {
    const top = searchTools(TOOLS, "png to jpg")[0];
    expect(top?.slug).toBe("png-to-jpg");
  });

  it("finds utility tools by kind words used in their summaries", () => {
    expect(names("timer")).toContain("Pomodoro Timer");
  });

  it("does not crash on a query of only separators", () => {
    expect(names("- / . _")).toEqual([...TOOLS].map((tool) => tool.name));
  });
});

describe("scoreTool", () => {
  it("gives 0 (not null) for an empty token list", () => {
    const tool = getToolBySlug("json-formatter");
    if (!tool) throw new Error("json-formatter missing from the registry");
    expect(scoreTool(tool, [])).toBe(0);
  });
});
