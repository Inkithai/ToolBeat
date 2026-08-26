/**
 * PDF reading and rendering — the only converter module that talks to
 * pdfjs-dist.
 *
 * Every function here is imported dynamically by the runners, so browsing the
 * directory never downloads the ~350 kB PDF engine. The worker is resolved
 * once per page load via `new URL(..., import.meta.url)`, which webpack emits
 * as a separate asset.
 *
 * The pure helpers (line assembly, heading heuristics, render scale) live
 * below the glue so they can be unit-tested without a browser or the worker.
 */

export type ExtractedItem = {
  str: string;
  hasEOL?: boolean;
  /** pdfjs text-space transform; |transform[3]| approximates the font size. */
  transform?: readonly number[];
};

export type DocBlock = {
  text: string;
  /** 0 = paragraph, 1 = heading level 1, 2 = heading level 2. */
  level: 0 | 1 | 2;
};

/* ------------------------------------------------------------------ *
 * Pure helpers (unit-testable, no browser APIs)
 * ------------------------------------------------------------------ */

/** Approximate font size for a text item from its text-space transform. */
export function itemFontSize(item: ExtractedItem): number {
  const transform = item.transform;
  if (!transform) return 0;
  const scale = Math.abs(transform[3] ?? transform[0] ?? 0);
  return Number.isFinite(scale) ? scale : 0;
}

/**
 * Group one page's raw text items into lines. pdfjs sets `hasEOL` on the item
 * that ends a visual line; items without it belong to the same line.
 */
export function pageItemsToLines(items: ExtractedItem[]): string[] {
  const lines: string[] = [];
  let current = "";
  for (const item of items) {
    if (!item.str) continue;
    current += item.str;
    if (item.hasEOL) {
      lines.push(current.trimEnd());
      current = "";
    }
  }
  if (current.trim()) lines.push(current.trimEnd());
  return lines;
}

/**
 * Median item font size, used as the "body size" reference. A median (not a
 * mean) survives pages full of small footnotes or one huge cover title.
 */
export function bodyFontSizeFor(items: ExtractedItem[]): number {
  const sizes = items
    .filter((item) => item.str && item.str.trim())
    .map(itemFontSize)
    .filter((size) => size > 0)
    .sort((a, b) => a - b);
  if (!sizes.length) return 12;
  return sizes[Math.floor(sizes.length / 2)];
}

/**
 * Heading heuristic: a line written clearly larger than the page's body text
 * becomes a heading. Thresholds are deliberately conservative so normal
 * emphasis (bold body text) is not promoted.
 */
export function headingLevelForSize(size: number, bodySize: number): 0 | 1 | 2 {
  if (!bodySize || size <= 0) return 0;
  const ratio = size / bodySize;
  if (ratio >= 1.45) return 1;
  if (ratio >= 1.15) return 2;
  return 0;
}

/**
 * Turn one page's text items into structured blocks: plain lines plus a
 * heading level derived from the page's own body size.
 */
export function pageItemsToBlocks(items: ExtractedItem[]): DocBlock[] {
  const bodySize = bodyFontSizeFor(items);
  const blocks: DocBlock[] = [];
  let current = "";
  let currentSize = 0;
  const flush = () => {
    const text = current.trim();
    if (text) {
      blocks.push({ text, level: headingLevelForSize(currentSize, bodySize) });
    }
    current = "";
    currentSize = 0;
  };
  for (const item of items) {
    if (!item.str) continue;
    if (!current) currentSize = itemFontSize(item);
    current += item.str;
    if (item.hasEOL) flush();
  }
  flush();
  return blocks;
}

/**
 * Plain-text rendering of extracted pages: paragraphs separated by blank
 * lines, pages separated by a blank line as well. Headings keep their text
 * (there is no markup to carry their level in plain text).
 */
export function blocksToPlainText(pages: DocBlock[][]): string {
  return pages
    .map((blocks) => blocks.map((block) => block.text).join("\n"))
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Render scale for rasterizing a page. 2× the nominal 72 dpi target (~144
 * effective dpi), capped so the longest edge never exceeds `maxEdgePx` —
 * canvas bitmaps beyond that are both slow and past any print need.
 */
export function renderScaleForPage(widthPt: number, heightPt: number, maxEdgePx = 2500): number {
  const maxEdgePt = Math.max(widthPt, heightPt);
  if (!maxEdgePt || !Number.isFinite(maxEdgePt)) return 2;
  // Canvas pixels = points × scale, so the cap is a direct ratio.
  return Math.min(2, maxEdgePx / maxEdgePt);
}

/* ------------------------------------------------------------------ *
 * Browser glue (pdfjs + canvas + docx; exercised in the app, not tests)
 * ------------------------------------------------------------------ */

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

function loadPdfjs(): Promise<typeof import("pdfjs-dist")> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      // Resolved once per page load; webpack emits the worker as an asset.
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

function isPasswordError(error: unknown): boolean {
  // pdfjs sets `name` on its typed exceptions; a string check keeps this
  // robust across pdfjs versions without importing its exception classes.
  return (
    error instanceof Error &&
    (error.name === "PasswordException" || /password/i.test(error.message))
  );
}

type LoadResult = {
  items: ExtractedItem[];
  widthPt: number;
  heightPt: number;
};

async function loadDocument(file: File): Promise<{
  task: import("pdfjs-dist").PDFDocumentLoadingTask;
  pageCount: number;
  pages: LoadResult[];
}> {
  const pdfjs = await loadPdfjs();
  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
  let doc: import("pdfjs-dist").PDFDocumentProxy;
  try {
    doc = await task.promise;
  } catch (error) {
    if (isPasswordError(error)) {
      throw new Error("This PDF is password-protected. Remove the password first, then try again.");
    }
    throw error;
  }

  const pages: LoadResult[] = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    // TextContent.items mixes text items with marked-content ranges; keep
    // only the ones that carry visible strings.
    const items: ExtractedItem[] = [];
    for (const entry of content.items) {
      const str = (entry as { str?: unknown }).str;
      if (typeof str !== "string") continue;
      const textItem = entry as { str: string; hasEOL?: boolean; transform?: number[] };
      items.push({ str: textItem.str, hasEOL: textItem.hasEOL, transform: textItem.transform });
    }
    pages.push({ items, widthPt: viewport.width, heightPt: viewport.height });
  }
  return { task, pageCount: doc.numPages, pages };
}

export async function pdfToTextBlob(file: File): Promise<Blob> {
  const { task, pages } = await loadDocument(file);
  const pagesOfBlocks = pages.map((page) => pageItemsToBlocks(page.items));
  const text = blocksToPlainText(pagesOfBlocks);
  await task.destroy();
  if (!text.trim()) {
    throw new Error(
      "No extractable text was found. This PDF may be a scanned image — use PDF → JPG to turn its pages into images first.",
    );
  }
  return new Blob([`${text}\n`], { type: "text/plain;charset=utf-8" });
}

export async function pdfToDocxBlob(file: File, title: string): Promise<Blob> {
  const { task, pages } = await loadDocument(file);
  const blocks = pages.flatMap((page) => pageItemsToBlocks(page.items));
  await task.destroy();
  if (!blocks.some((block) => block.text)) {
    throw new Error("No extractable text was found in this PDF.");
  }
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
  const { DOCUMENT_CREATOR } = await import("@/constants/brand");
  const document = new Document({
    creator: DOCUMENT_CREATOR,
    title,
    sections: [
      {
        children: blocks.map((block) => {
          if (block.level === 1) {
            return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(block.text)] });
          }
          if (block.level === 2) {
            return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(block.text)] });
          }
          return new Paragraph({ children: [new TextRun(block.text)] });
        }),
      },
    ],
  });
  return Packer.toBlob(document);
}

export async function pdfToImagesBlob(
  file: File,
  mimeType: "image/jpeg" | "image/png",
  quality: number,
): Promise<Blob> {
  const { task, pages } = await loadDocument(file);
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (let pageNumber = 1; pageNumber <= pages.length; pageNumber += 1) {
    const { widthPt, heightPt } = pages[pageNumber - 1];
    const page = await (await task.promise).getPage(pageNumber);
    const scale = renderScaleForPage(widthPt, heightPt);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    const context = canvas.getContext("2d");
    if (!context) {
      await task.destroy();
      throw new Error("Canvas is not supported by this browser.");
    }
    if (mimeType === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    await page.render({ canvas, canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result && result.type === mimeType
            ? resolve(result)
            : reject(new Error(`This browser could not export ${mimeType.split("/")[1].toUpperCase()} pages.`)),
        mimeType,
        quality,
      );
    });
    zip.file(`page-${String(pageNumber).padStart(2, "0")}.${mimeType === "image/png" ? "png" : "jpg"}`, blob);
  }
  await task.destroy();

  return zip.generateAsync({ type: "blob" });
}
