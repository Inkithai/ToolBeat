import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/constants/app";
import { getToolBySlug, getToolsByCategory, TOOLS } from "./registry";

describe("tool registry", () => {
  it("contains at least 30 tools", () => {
    expect(TOOLS.length).toBeGreaterThanOrEqual(30);
  });

  it("assigns unique slugs to every tool", () => {
    const slugs = TOOLS.map((tool) => tool.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("assigns unique hrefs to every tool", () => {
    const hrefs = TOOLS.map((tool) => tool.href);
    const uniqueHrefs = new Set(hrefs);
    expect(uniqueHrefs.size).toBe(hrefs.length);
  });

  it("ensures every tool belongs to a valid category", () => {
    const validCategoryKeys = CATEGORIES.map((c) => c.key);
    for (const tool of TOOLS) {
      expect(validCategoryKeys).toContain(tool.category);
    }
  });

  it("ensures every tool has non-empty tags", () => {
    for (const tool of TOOLS) {
      expect(tool.tags.length).toBeGreaterThan(0);
      for (const tag of tool.tags) {
        expect(tag.trim()).not.toBe("");
      }
    }
  });

  it("fetches tool by slug correctly", () => {
    const jsonFormatter = getToolBySlug("json-formatter");
    expect(jsonFormatter).toBeDefined();
    expect(jsonFormatter?.name).toBe("JSON Formatter");

    const nonExistent = getToolBySlug("non-existent-tool-slug");
    expect(nonExistent).toBeUndefined();
  });

  it("filters tools by category correctly", () => {
    const devTools = getToolsByCategory("developer");
    expect(devTools.length).toBeGreaterThan(0);
    for (const tool of devTools) {
      expect(tool.category).toBe("developer");
    }
  });
});
