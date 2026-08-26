/**
 * Brand strings now live in `@/constants/brand`. Re-exported here so existing
 * import paths keep working.
 */
export { APP_NAME, TAGLINE } from "./brand";

export const CATEGORIES = [
  { key: "documents", label: "Files & Conversion", icon: "FileText", description: "PDF, DOCX, Markdown, HTML and text formats", verbs: "Convert, compress, transform, extract" },
  { key: "images", label: "Images", icon: "Image", description: "PNG, JPG, WebP and SVG conversion", verbs: "Convert, resize, re-encode, extract" },
  { key: "developer", label: "Developer & Data", icon: "Code2", description: "JSON, YAML, XML, CSV, Base64 and encoding", verbs: "JSON, JWT, Base64, UUID, Regex" },
  { key: "utilities", label: "Text & Writing", icon: "Timer", description: "Text formatting, counting, and writing tools", verbs: "Count, clean, compare, transform" },
  { key: "calculators", label: "Calculators", icon: "Calculator", description: "Percentages, dates, finance and everyday math", verbs: "Percentages, dates, interest, units" },
  { key: "security", label: "Security", icon: "ShieldCheck", description: "Hashing, passwords, tokens and identifiers — all on-device", verbs: "Hash, generate, inspect, protect" },
  { key: "web", label: "Web & URLs", icon: "Globe", description: "URL parsing, query strings, UTM tags and robots.txt", verbs: "Parse, build, tag, inspect" },
  { key: "generators", label: "Generators", icon: "Sparkles", description: "Color palettes, gradients, mock data and barcodes", verbs: "Generate, randomize, mock, compose" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

type ConversionDefinition = {
  from: string;
  to: string;
  fromFormat: string;
  toFormat: string;
  category: CategoryKey;
  description: string;
  acceptedExtensions: readonly string[];
  outputExtension: string;
};

/**
 * This is the single source of truth for every tool displayed by ConvertLab.
 * A tool should only be added here when its conversion is implemented in the
 * conversion client. Keeping discovery and execution in sync prevents the UI
 * from advertising formats that only lead to an unimplemented screen.
 */
export const CONVERSIONS = {
  "markdown-to-pdf": {
    from: "Markdown (.md)", to: "PDF (.pdf)", fromFormat: "Markdown", toFormat: "PDF", category: "documents",
    description: "Create a clean, paginated PDF with readable typography.", acceptedExtensions: [".md", ".markdown"], outputExtension: ".pdf",
  },
  "markdown-to-docx": {
    from: "Markdown (.md)", to: "DOCX (.docx)", fromFormat: "Markdown", toFormat: "DOCX", category: "documents",
    description: "Turn Markdown headings, lists and tables into a Word document.", acceptedExtensions: [".md", ".markdown"], outputExtension: ".docx",
  },
  "markdown-to-html": {
    from: "Markdown (.md)", to: "HTML (.html)", fromFormat: "Markdown", toFormat: "HTML", category: "documents",
    description: "Export Markdown as a complete, styled HTML document.", acceptedExtensions: [".md", ".markdown"], outputExtension: ".html",
  },
  "docx-to-markdown": {
    from: "DOCX (.docx)", to: "Markdown (.md)", fromFormat: "DOCX", toFormat: "Markdown", category: "documents",
    description: "Extract Word document content as portable Markdown.", acceptedExtensions: [".docx"], outputExtension: ".md",
  },
  "docx-to-html": {
    from: "DOCX (.docx)", to: "HTML (.html)", fromFormat: "DOCX", toFormat: "HTML", category: "documents",
    description: "Convert a Word document into clean HTML.", acceptedExtensions: [".docx"], outputExtension: ".html",
  },
  "docx-to-pdf": {
    from: "DOCX (.docx)", to: "PDF (.pdf)", fromFormat: "DOCX", toFormat: "PDF", category: "documents",
    description: "Lay out a Word document on readable PDF pages.", acceptedExtensions: [".docx"], outputExtension: ".pdf",
  },
  "pdf-to-txt": {
    from: "PDF (.pdf)", to: "Text (.txt)", fromFormat: "PDF", toFormat: "Text", category: "documents",
    description: "Extract the readable text from every page, in reading order.", acceptedExtensions: [".pdf"], outputExtension: ".txt",
  },
  "pdf-to-jpg": {
    from: "PDF (.pdf)", to: "JPG ZIP (.zip)", fromFormat: "PDF", toFormat: "JPG", category: "documents",
    description: "Render each page as a JPG image and bundle them in a ZIP.", acceptedExtensions: [".pdf"], outputExtension: ".zip",
  },
  "pdf-to-png": {
    from: "PDF (.pdf)", to: "PNG ZIP (.zip)", fromFormat: "PDF", toFormat: "PNG", category: "documents",
    description: "Render each page as a PNG image and bundle them in a ZIP.", acceptedExtensions: [".pdf"], outputExtension: ".zip",
  },
  "pdf-to-docx": {
    from: "PDF (.pdf)", to: "DOCX (.docx)", fromFormat: "PDF", toFormat: "DOCX", category: "documents",
    description: "Extract the text and rebuild it as an editable Word document.", acceptedExtensions: [".pdf"], outputExtension: ".docx",
  },
  "html-to-pdf": {
    from: "HTML (.html)", to: "PDF (.pdf)", fromFormat: "HTML", toFormat: "PDF", category: "documents",
    description: "Render an HTML document as a consistently spaced PDF.", acceptedExtensions: [".html", ".htm"], outputExtension: ".pdf",
  },
  "txt-to-pdf": {
    from: "Text (.txt)", to: "PDF (.pdf)", fromFormat: "Text", toFormat: "PDF", category: "documents",
    description: "Lay out plain text on readable PDF pages.", acceptedExtensions: [".txt"], outputExtension: ".pdf",
  },

  "png-to-jpg": {
    from: "PNG (.png)", to: "JPG (.jpg)", fromFormat: "PNG", toFormat: "JPG", category: "images",
    description: "Create a compact JPG with a white transparency background.", acceptedExtensions: [".png"], outputExtension: ".jpg",
  },
  "png-to-webp": {
    from: "PNG (.png)", to: "WebP (.webp)", fromFormat: "PNG", toFormat: "WebP", category: "images",
    description: "Compress a PNG into a modern WebP image.", acceptedExtensions: [".png"], outputExtension: ".webp",
  },
  "jpg-to-png": {
    from: "JPG (.jpg)", to: "PNG (.png)", fromFormat: "JPG", toFormat: "PNG", category: "images",
    description: "Export a JPG image in lossless PNG format.", acceptedExtensions: [".jpg", ".jpeg"], outputExtension: ".png",
  },
  "jpg-to-webp": {
    from: "JPG (.jpg)", to: "WebP (.webp)", fromFormat: "JPG", toFormat: "WebP", category: "images",
    description: "Compress a JPG into a modern WebP image.", acceptedExtensions: [".jpg", ".jpeg"], outputExtension: ".webp",
  },
  "webp-to-png": {
    from: "WebP (.webp)", to: "PNG (.png)", fromFormat: "WebP", toFormat: "PNG", category: "images",
    description: "Convert WebP into a widely supported lossless PNG.", acceptedExtensions: [".webp"], outputExtension: ".png",
  },
  "webp-to-jpg": {
    from: "WebP (.webp)", to: "JPG (.jpg)", fromFormat: "WebP", toFormat: "JPG", category: "images",
    description: "Convert WebP to JPG with a white transparency background.", acceptedExtensions: [".webp"], outputExtension: ".jpg",
  },
  "svg-to-png": {
    from: "SVG (.svg)", to: "PNG (.png)", fromFormat: "SVG", toFormat: "PNG", category: "images",
    description: "Rasterize a scalable SVG as a transparent PNG.", acceptedExtensions: [".svg"], outputExtension: ".png",
  },

  "json-to-yaml": {
    from: "JSON (.json)", to: "YAML (.yaml)", fromFormat: "JSON", toFormat: "YAML", category: "developer",
    description: "Convert JSON data into readable YAML.", acceptedExtensions: [".json"], outputExtension: ".yaml",
  },
  "yaml-to-json": {
    from: "YAML (.yaml)", to: "JSON (.json)", fromFormat: "YAML", toFormat: "JSON", category: "developer",
    description: "Parse YAML and output formatted JSON.", acceptedExtensions: [".yaml", ".yml"], outputExtension: ".json",
  },
  "csv-to-json": {
    from: "CSV (.csv)", to: "JSON (.json)", fromFormat: "CSV", toFormat: "JSON", category: "developer",
    description: "Turn CSV rows into an array of JSON objects.", acceptedExtensions: [".csv"], outputExtension: ".json",
  },
  "json-to-csv": {
    from: "JSON (.json)", to: "CSV (.csv)", fromFormat: "JSON", toFormat: "CSV", category: "developer",
    description: "Convert an array of JSON objects into CSV.", acceptedExtensions: [".json"], outputExtension: ".csv",
  },
  "json-to-xml": {
    from: "JSON (.json)", to: "XML (.xml)", fromFormat: "JSON", toFormat: "XML", category: "developer",
    description: "Build a well-formed XML document from JSON data.", acceptedExtensions: [".json"], outputExtension: ".xml",
  },
  "xml-to-json": {
    from: "XML (.xml)", to: "JSON (.json)", fromFormat: "XML", toFormat: "JSON", category: "developer",
    description: "Parse XML elements and attributes into formatted JSON.", acceptedExtensions: [".xml"], outputExtension: ".json",
  },
  "csv-to-xml": {
    from: "CSV (.csv)", to: "XML (.xml)", fromFormat: "CSV", toFormat: "XML", category: "developer",
    description: "Build a well-formed XML document from CSV rows.", acceptedExtensions: [".csv"], outputExtension: ".xml",
  },

  "csv-to-markdown": {
    from: "CSV (.csv)", to: "Markdown Table (.md)", fromFormat: "CSV", toFormat: "Markdown", category: "developer",
    description: "Format CSV data as a Markdown table.", acceptedExtensions: [".csv"], outputExtension: ".md",
  },
  "markdown-to-csv": {
    from: "Markdown Table (.md)", to: "CSV (.csv)", fromFormat: "Markdown", toFormat: "CSV", category: "developer",
    description: "Extract the first Markdown table as CSV data.", acceptedExtensions: [".md", ".markdown"], outputExtension: ".csv",
  },

  "markdown-to-txt": {
    from: "Markdown (.md)", to: "Text (.txt)", fromFormat: "Markdown", toFormat: "Text", category: "documents",
    description: "Remove Markdown syntax while retaining readable text structure.", acceptedExtensions: [".md", ".markdown"], outputExtension: ".txt",
  },
  "html-to-txt": {
    from: "HTML (.html)", to: "Text (.txt)", fromFormat: "HTML", toFormat: "Text", category: "documents",
    description: "Extract readable plain text from an HTML document.", acceptedExtensions: [".html", ".htm"], outputExtension: ".txt",
  },
  "html-to-markdown": {
    from: "HTML (.html)", to: "Markdown (.md)", fromFormat: "HTML", toFormat: "Markdown", category: "documents",
    description: "Convert an HTML document into clean, readable Markdown.", acceptedExtensions: [".html", ".htm"], outputExtension: ".md",
  },
} as const satisfies Record<string, ConversionDefinition>;

export type ConversionType = keyof typeof CONVERSIONS;

export const CONVERSION_ENTRIES = Object.entries(CONVERSIONS) as [
  ConversionType,
  (typeof CONVERSIONS)[ConversionType],
][];

export function isConversionType(value: string): value is ConversionType {
  return Object.prototype.hasOwnProperty.call(CONVERSIONS, value);
}

export const FILE_LIMIT_MB = 50;
