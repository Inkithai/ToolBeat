import { describe, expect, it } from "vitest";
import { getRelatedToolSlugs } from "./related-tools";

describe("getRelatedToolSlugs", () => {
  it("returns related tools for json-formatter", () => {
    const related = getRelatedToolSlugs("json-formatter");
    expect(related).toBeDefined();
    expect(related.length).toBeGreaterThan(0);
    expect(related).not.toContain("json-formatter");
  });

  it("returns empty array for non-existent tool", () => {
    const related = getRelatedToolSlugs("invalid-tool-slug");
    expect(related).toEqual([]);
  });
});
