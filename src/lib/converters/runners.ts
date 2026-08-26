import type { ConversionType } from "@/constants/app";

/**
 * Conversion dispatch.
 *
 * This replaces a 24-case `switch` that lived inside the conversion UI
 * component. Two problems it fixes:
 *
 * 1. The component statically imported every converter module, so choosing
 *    `png-to-jpg` — pure canvas work — still downloaded the YAML, CSV, XML and
 *    DOCX parsers. Every runner below imports its dependencies dynamically, so
 *    a conversion only pays for the code it actually runs.
 * 2. Adding a converter meant editing a UI file. Now it means adding an entry
 *    to this map.
 *
 * The `Record<ConversionType, ConversionRunner>` type preserves the existing
 * invariant: a conversion advertised in the catalog with no runner here is a
 * compile error, not a broken page.
 */

export type ConversionOptions = {
  /** Font stack for generated PDF/HTML output. */
  pdfFontFamily: string;
  pageSize: "A4" | "Letter" | "Auto";
  /** Raster quality as a percentage (0-100). */
  imageQuality: number;
  /** Source file name without its extension, used as a document title. */
  title: string;
};

export type ConversionRunner = (file: File, options: ConversionOptions) => Promise<Blob>;

function textBlob(value: string, mimeType: string): Blob {
  return new Blob([value], { type: `${mimeType};charset=utf-8` });
}

/**
 * Most converters are "read the file as text, transform the string, wrap the
 * result in a Blob". This removes that repetition without hiding what each
 * conversion does.
 */
function textRunner(
  mimeType: string,
  transform: (input: string) => string | Promise<string>
): ConversionRunner {
  return async (file) => textBlob(await transform(await file.text()), mimeType);
}

const pdfRunner = (toHtmlBody: (input: string) => string): ConversionRunner =>
  async (file, options) => {
    const { renderHtmlToPdfBlob } = await import("./documents");
    return renderHtmlToPdfBlob({
      htmlBody: toHtmlBody(await file.text()),
      fontFamily: options.pdfFontFamily,
      pageSize: options.pageSize,
      title: options.title,
    });
  };

const imageRunner = (
  mimeType: "image/jpeg" | "image/png" | "image/webp",
  /** PNG is lossless, so it ignores the quality setting. */
  useQuality: boolean
): ConversionRunner =>
  async (file, options) => {
    const { convertImage } = await import("./image");
    return convertImage(file, mimeType, useQuality ? options.imageQuality / 100 : 1);
  };

export const CONVERSION_RUNNERS: Record<ConversionType, ConversionRunner> = {
  "markdown-to-pdf": async (file, options) => {
    const { markdownToHtml } = await import("./documents");
    return pdfRunner(markdownToHtml)(file, options);
  },
  "txt-to-pdf": async (file, options) => {
    const { textToHtml } = await import("./documents");
    return pdfRunner(textToHtml)(file, options);
  },
  "html-to-pdf": async (file, options) => {
    const { htmlDocumentToBody } = await import("./documents");
    return pdfRunner(htmlDocumentToBody)(file, options);
  },

  "markdown-to-html": async (file, options) => {
    const { buildPdfHtml, markdownToHtml } = await import("./documents");
    return textBlob(buildPdfHtml(markdownToHtml(await file.text()), options.pdfFontFamily, options.title), "text/html");
  },
  "markdown-to-txt": async (file) => {
    const { markdownToPlainText } = await import("./documents");
    return textBlob(`${markdownToPlainText(await file.text())}\n`, "text/plain");
  },
  "html-to-txt": async (file) => {
    const { htmlToPlainText } = await import("./documents");
    return textBlob(`${htmlToPlainText(await file.text())}\n`, "text/plain");
  },
  "html-to-markdown": textRunner("text/markdown", async (input) => (await import("./documents")).htmlToMarkdown(input)),

  "markdown-to-docx": async (file, options) => {
    const { markdownToDocxBlob } = await import("./office");
    return markdownToDocxBlob(await file.text(), options.title);
  },
  "docx-to-markdown": async (file) => {
    const { docxToMarkdownText } = await import("./office");
    return textBlob(await docxToMarkdownText(file), "text/markdown");
  },
  "docx-to-html": async (file, options) => {
    const [{ docxToHtmlText }, { buildPdfHtml }] = await Promise.all([
      import("./office"),
      import("./documents"),
    ]);
    return textBlob(buildPdfHtml(await docxToHtmlText(file), options.pdfFontFamily, options.title), "text/html");
  },
  "docx-to-pdf": async (file, options) => {
    const [{ docxToHtmlText }, { renderHtmlToPdfBlob }] = await Promise.all([
      import("./office"),
      import("./documents"),
    ]);
    return renderHtmlToPdfBlob({
      htmlBody: await docxToHtmlText(file),
      fontFamily: options.pdfFontFamily,
      pageSize: options.pageSize,
      title: options.title,
    });
  },

  "pdf-to-txt": async (file) => {
    const { pdfToTextBlob } = await import("./pdf");
    return pdfToTextBlob(file);
  },
  "pdf-to-jpg": async (file, options) => {
    const { pdfToImagesBlob } = await import("./pdf");
    return pdfToImagesBlob(file, "image/jpeg", options.imageQuality / 100);
  },
  "pdf-to-png": async (file) => {
    const { pdfToImagesBlob } = await import("./pdf");
    return pdfToImagesBlob(file, "image/png", 1);
  },
  "pdf-to-docx": async (file, options) => {
    const { pdfToDocxBlob } = await import("./pdf");
    return pdfToDocxBlob(file, options.title);
  },

  "json-to-yaml": textRunner("application/yaml", async (input) => (await import("./data")).jsonToYaml(input)),
  "yaml-to-json": textRunner("application/json", async (input) => (await import("./data")).yamlToJson(input)),
  "csv-to-json": textRunner("application/json", async (input) => (await import("./data")).csvToJson(input)),
  "json-to-csv": textRunner("text/csv", async (input) => (await import("./data")).jsonToCsv(input)),
  "csv-to-markdown": textRunner("text/markdown", async (input) => (await import("./data")).csvToMarkdown(input)),
  "markdown-to-csv": textRunner("text/csv", async (input) => (await import("./data")).markdownToCsv(input)),
  "json-to-xml": textRunner("application/xml", async (input) => (await import("./data")).jsonToXml(input)),
  "xml-to-json": textRunner("application/json", async (input) => (await import("./data")).xmlToJson(input)),
  "csv-to-xml": textRunner("application/xml", async (input) => (await import("./data")).csvToXml(input)),

  "png-to-jpg": imageRunner("image/jpeg", true),
  "webp-to-jpg": imageRunner("image/jpeg", true),
  "png-to-webp": imageRunner("image/webp", true),
  "jpg-to-webp": imageRunner("image/webp", true),
  "jpg-to-png": imageRunner("image/png", false),
  "webp-to-png": imageRunner("image/png", false),
  "svg-to-png": imageRunner("image/png", false),
};

export function getConversionRunner(type: ConversionType): ConversionRunner {
  return CONVERSION_RUNNERS[type];
}
