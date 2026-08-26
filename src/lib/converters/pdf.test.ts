import { describe, expect, it } from "vitest";
import {
  blocksToPlainText,
  bodyFontSizeFor,
  headingLevelForSize,
  itemFontSize,
  pageItemsToBlocks,
  pageItemsToLines,
  renderScaleForPage,
  type ExtractedItem,
} from "./pdf";

/** Build an item with the minimum fields pdfjs text items carry. */
const item = (str: string, size = 12, hasEOL = true): ExtractedItem => ({
  str,
  hasEOL,
  transform: [size, 0, 0, size, 100, 100],
});

describe("itemFontSize", () => {
  it("reads the vertical scale from the transform", () => {
    expect(itemFontSize(item("x", 14))).toBe(14);
    expect(itemFontSize({ str: "x" })).toBe(0);
    expect(itemFontSize({ str: "x", transform: [0, 0, 0, Number.NaN, 0, 0] })).toBe(0);
  });
});

describe("pageItemsToLines", () => {
  it("joins items until hasEOL", () => {
    const lines = pageItemsToLines([
      { str: "Hello " },
      { str: "world", hasEOL: true },
      { str: "Next line" },
    ]);
    expect(lines).toEqual(["Hello world", "Next line"]);
  });

  it("skips empty items and trailing whitespace", () => {
    const lines = pageItemsToLines([
      { str: "" },
      { str: "A ", hasEOL: true },
      { str: "B", hasEOL: true },
    ]);
    expect(lines).toEqual(["A", "B"]);
  });
});

describe("bodyFontSizeFor", () => {
  it("uses the median, not the mean", () => {
    const items = [item("body", 11), item("body", 12), item("body", 12), item("title", 24)];
    expect(bodyFontSizeFor(items)).toBe(12);
  });

  it("falls back to 12 for text-less pages", () => {
    expect(bodyFontSizeFor([item("", 12)])).toBe(12);
  });
});

describe("headingLevelForSize", () => {
  it("promotes clearly larger lines only", () => {
    expect(headingLevelForSize(20, 12)).toBe(1);
    expect(headingLevelForSize(15, 12)).toBe(2);
    expect(headingLevelForSize(13, 12)).toBe(0);
    expect(headingLevelForSize(20, 0)).toBe(0);
  });
});

describe("pageItemsToBlocks", () => {
  it("derives headings from the page's own body size", () => {
    const blocks = pageItemsToBlocks([
      item("Big Title", 22),
      item("Body line one", 12),
      item("Body line two", 12),
    ]);
    expect(blocks).toEqual([
      { text: "Big Title", level: 1 },
      { text: "Body line one", level: 0 },
      { text: "Body line two", level: 0 },
    ]);
  });

  it("ignores blank lines", () => {
    const blocks = pageItemsToBlocks([item("  ", 12), item("Real", 12)]);
    expect(blocks).toEqual([{ text: "Real", level: 0 }]);
  });
});

describe("blocksToPlainText", () => {
  it("separates paragraphs and pages with blank lines", () => {
    const text = blocksToPlainText([
      [{ text: "One", level: 0 }, { text: "Two", level: 1 }],
      [{ text: "Three", level: 0 }],
    ]);
    expect(text).toBe("One\nTwo\n\nThree");
  });

  it("collapses excess blank lines", () => {
    expect(blocksToPlainText([[], [{ text: "Only", level: 0 }]])).toBe("Only");
  });
});

describe("renderScaleForPage", () => {
  it("defaults to 2× for normal page sizes", () => {
    expect(renderScaleForPage(595, 842)).toBe(2);
  });

  it("caps huge pages to the pixel budget", () => {
    const scale = renderScaleForPage(5000, 3000);
    expect(scale).toBeCloseTo(2500 / 5000, 10);
    expect(scale * 5000).toBeLessThanOrEqual(2500 + 0.001);
  });

  it("falls back safely for degenerate pages", () => {
    expect(renderScaleForPage(0, 0)).toBe(2);
    expect(renderScaleForPage(Number.NaN, 100)).toBe(2);
  });
});
