import { DOCUMENT_CREATOR } from "@/constants/brand";
import type { FileChild, IParagraphOptions, IRunOptions, Paragraph, ParagraphChild, Table } from "docx";
import { markdownToHtml } from "@/lib/converters/documents";

type DocxModule = typeof import("docx");

type BlockContext = {
  listLevel: number;
  quoteDepth: number;
};

type InlineFormatting = {
  bold?: boolean;
  italics?: boolean;
  strike?: boolean;
  code?: boolean;
  color?: string;
};

const DEFAULT_CONTEXT: BlockContext = {
  listLevel: 0,
  quoteDepth: 0,
};

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const ORDERED_LIST_REFERENCE = "convertlab-ordered-list";
const MAX_LIST_DEPTH = 5;

export async function markdownToDocxBlob(markdownText: string, title = "Document"): Promise<Blob> {
  if (typeof DOMParser === "undefined") {
    throw new Error("DOCX generation is only available in the browser.");
  }

  const docx = await import("docx");
  const html = markdownToHtml(markdownText);
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const children = convertBlockNodes(docx, Array.from(parsed.body.childNodes), DEFAULT_CONTEXT);

  const document = new docx.Document({
    creator: DOCUMENT_CREATOR,
    title,
    description: `Converted from Markdown by ${DOCUMENT_CREATOR}`,
    numbering: {
      config: [
        {
          reference: ORDERED_LIST_REFERENCE,
          levels: Array.from({ length: MAX_LIST_DEPTH + 1 }, (_, level) => ({
            level,
            format: docx.LevelFormat.DECIMAL,
            text: `%${level + 1}.`,
            alignment: docx.AlignmentType.START,
            style: {
              paragraph: {
                indent: {
                  left: 720 + level * 360,
                  hanging: 260,
                },
              },
            },
          })),
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: children.length ? children : [new docx.Paragraph("")],
      },
    ],
  });

  const blob = await docx.Packer.toBlob(document);
  return blob.type ? blob : new Blob([await blob.arrayBuffer()], { type: DOCX_MIME });
}

export async function docxToMarkdownText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToMarkdown({ arrayBuffer });
  const markdown = result.value.trim();

  return markdown ? `${markdown}\n` : "";
}

export async function docxToHtmlText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value.trim();
}

function convertBlockNodes(docx: DocxModule, nodes: ChildNode[], context: BlockContext): FileChild[] {
  return nodes.flatMap((node) => convertSingleBlockNode(docx, node, context));
}

function convertSingleBlockNode(docx: DocxModule, node: ChildNode, context: BlockContext): FileChild[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = collapsePlainText(node.textContent || "");
    if (!text.trim()) return [];

    return [
      new docx.Paragraph({
        ...getBaseParagraphOptions(docx, context),
        children: [new docx.TextRun({ text })],
      }),
    ];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();

  if (/^h[1-6]$/.test(tag)) {
    const level = Number(tag.slice(1));
    return [
      new docx.Paragraph({
        ...getBaseParagraphOptions(docx, context),
        heading: getHeadingLevel(docx, level),
        spacing: { before: level === 1 ? 0 : 240, after: 120 },
        children: ensureInlineChildren(docx, createInlineChildren(docx, Array.from(element.childNodes))),
      }),
    ];
  }

  if (tag === "p") {
    return [
      new docx.Paragraph({
        ...getBaseParagraphOptions(docx, context),
        children: ensureInlineChildren(docx, createInlineChildren(docx, Array.from(element.childNodes))),
      }),
    ];
  }

  if (tag === "pre") {
    return [createCodeBlockParagraph(docx, element.textContent || "", context)];
  }

  if (tag === "blockquote") {
    return convertBlockNodes(docx, Array.from(element.childNodes), {
      ...context,
      quoteDepth: context.quoteDepth + 1,
    });
  }

  if (tag === "ul" || tag === "ol") {
    return convertListElement(docx, element, tag === "ol", context);
  }

  if (tag === "hr") {
    return [
      new docx.Paragraph({
        ...getBaseParagraphOptions(docx, context),
        border: {
          bottom: {
            color: "CBD5E1",
            space: 1,
            style: docx.BorderStyle.SINGLE,
            size: 6,
          },
        },
        spacing: { before: 240, after: 240 },
      }),
    ];
  }

  if (tag === "table") {
    return [createTable(docx, element as HTMLTableElement)];
  }

  if (tag === "img") {
    const alt = element.getAttribute("alt")?.trim() || "Image";
    return [
      new docx.Paragraph({
        ...getBaseParagraphOptions(docx, context),
        children: [new docx.TextRun({ text: `[${alt}]`, italics: true, color: "475569" })],
      }),
    ];
  }

  return convertBlockNodes(docx, Array.from(element.childNodes), context);
}

function convertListElement(docx: DocxModule, listElement: HTMLElement, ordered: boolean, context: BlockContext): Paragraph[] {
  const items = Array.from(listElement.children).filter((child) => child.tagName.toLowerCase() === "li") as HTMLElement[];

  return items.flatMap((item) => convertListItem(docx, item, ordered, context));
}

function convertListItem(docx: DocxModule, item: HTMLElement, ordered: boolean, context: BlockContext): Paragraph[] {
  const markerOptions = ordered
    ? { numbering: { reference: ORDERED_LIST_REFERENCE, level: clampListLevel(context.listLevel) } }
    : { bullet: { level: clampListLevel(context.listLevel) } };

  const contentClone = item.cloneNode(true) as HTMLElement;
  Array.from(contentClone.children).forEach((child) => {
    const tag = child.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      child.remove();
    }
  });

  const children: Paragraph[] = [];
  if (hasVisibleContent(contentClone)) {
    children.push(
      new docx.Paragraph({
        ...getBaseParagraphOptions(docx, context),
        ...markerOptions,
        spacing: { after: 100 },
        children: ensureInlineChildren(docx, createInlineChildren(docx, Array.from(contentClone.childNodes))),
      })
    );
  }

  Array.from(item.children).forEach((child) => {
    const tag = child.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      children.push(
        ...convertListElement(docx, child as HTMLElement, tag === "ol", {
          ...context,
          listLevel: context.listLevel + 1,
        })
      );
    }
  });

  return children;
}

function createTable(docx: DocxModule, tableElement: HTMLTableElement): Table {
  const rows = Array.from(tableElement.rows).map((row, rowIndex) => {
    const isHeaderRow = rowIndex === 0 || row.parentElement?.tagName.toLowerCase() === "thead";

    return new docx.TableRow({
      children: Array.from(row.cells).map((cell) =>
        new docx.TableCell({
          children: [
            new docx.Paragraph({
              spacing: { after: 0 },
              children: ensureInlineChildren(
                docx,
                createInlineChildren(docx, Array.from(cell.childNodes), {
                  bold: isHeaderRow || cell.tagName.toLowerCase() === "th",
                })
              ),
            }),
          ],
          shading: isHeaderRow || cell.tagName.toLowerCase() === "th" ? { fill: "F8FAFC" } : undefined,
        })
      ),
    });
  });

  return new docx.Table({
    rows,
    width: {
      size: 100,
      type: docx.WidthType.PERCENTAGE,
    },
  });
}

function createCodeBlockParagraph(docx: DocxModule, text: string, context: BlockContext): Paragraph {
  const lines = text.replace(/\n$/, "").split("\n");
  const children = lines.flatMap((line, index) => {
    const content = line || " ";
    if (index === 0) {
      return [new docx.TextRun({ text: content, font: "Courier New", size: 20 })];
    }

    return [new docx.TextRun({ text: content, break: 1, font: "Courier New", size: 20 })];
  });

  return new docx.Paragraph({
    ...getBaseParagraphOptions(docx, context),
    shading: { fill: "F8FAFC" },
    border: {
      top: { color: "E2E8F0", size: 6, style: docx.BorderStyle.SINGLE },
      bottom: { color: "E2E8F0", size: 6, style: docx.BorderStyle.SINGLE },
      left: { color: "E2E8F0", size: 6, style: docx.BorderStyle.SINGLE },
      right: { color: "E2E8F0", size: 6, style: docx.BorderStyle.SINGLE },
    },
    spacing: { after: 180 },
    children: children.length ? children : [new docx.TextRun({ text: " ", font: "Courier New", size: 20 })],
  });
}

function createInlineChildren(docx: DocxModule, nodes: ChildNode[], formatting: InlineFormatting = {}): ParagraphChild[] {
  const children: ParagraphChild[] = [];

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const normalizedText = formatInlineText(node.textContent || "", formatting.code);
      if (!normalizedText) return;

      if (!normalizedText.trim()) {
        children.push(new docx.TextRun(buildTextRunOptions(" ", formatting)));
        return;
      }

      children.push(new docx.TextRun(buildTextRunOptions(normalizedText, formatting)));
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (tag === "br") {
      children.push(new docx.TextRun({ text: "", break: 1 }));
      return;
    }

    if (tag === "a") {
      const linkChildren = ensureInlineChildren(
        docx,
        createInlineChildren(docx, Array.from(element.childNodes), {
          ...formatting,
          color: formatting.color || "0F766E",
        })
      );
      const link = element.getAttribute("href") || "#";
      children.push(new docx.ExternalHyperlink({ link, children: linkChildren }));
      return;
    }

    if (tag === "img") {
      const alt = element.getAttribute("alt")?.trim() || "Image";
      children.push(new docx.TextRun(buildTextRunOptions(`[${alt}]`, { ...formatting, italics: true })));
      return;
    }

    const nextFormatting: InlineFormatting = {
      ...formatting,
      bold: formatting.bold || tag === "strong" || tag === "b",
      italics: formatting.italics || tag === "em" || tag === "i",
      strike: formatting.strike || tag === "s" || tag === "del",
      code: formatting.code || tag === "code",
    };

    children.push(...createInlineChildren(docx, Array.from(element.childNodes), nextFormatting));
  });

  return children;
}

function buildTextRunOptions(text: string, formatting: InlineFormatting): IRunOptions {
  return {
    text,
    bold: formatting.bold,
    italics: formatting.italics,
    strike: formatting.strike,
    color: formatting.color,
    font: formatting.code ? "Courier New" : undefined,
    size: formatting.code ? 20 : undefined,
  };
}

function ensureInlineChildren(docx: DocxModule, children: ParagraphChild[]): ParagraphChild[] {
  return children.length ? children : [new docx.TextRun("")];
}

function getBaseParagraphOptions(docx: DocxModule, context: BlockContext): Omit<IParagraphOptions, "children" | "text"> {
  if (context.quoteDepth > 0) {
    return {
      spacing: { after: 160 },
      indent: {
        left: context.quoteDepth * 320,
      },
      border: {
        left: {
          color: "94A3B8",
          size: 10,
          style: docx.BorderStyle.SINGLE,
          space: 8,
        },
      },
    };
  }

  return {
    spacing: { after: 160 },
  };
}

function getHeadingLevel(docx: DocxModule, level: number): NonNullable<IParagraphOptions["heading"]> {
  const headings = [
    docx.HeadingLevel.HEADING_1,
    docx.HeadingLevel.HEADING_2,
    docx.HeadingLevel.HEADING_3,
    docx.HeadingLevel.HEADING_4,
    docx.HeadingLevel.HEADING_5,
    docx.HeadingLevel.HEADING_6,
  ];

  return headings[Math.min(Math.max(level, 1), 6) - 1];
}

function clampListLevel(level: number): number {
  return Math.min(Math.max(level, 0), MAX_LIST_DEPTH);
}

function hasVisibleContent(element: HTMLElement): boolean {
  return collapsePlainText(element.textContent || "").trim().length > 0;
}

function collapsePlainText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function formatInlineText(text: string, preserveWhitespace = false): string {
  if (preserveWhitespace) {
    return text.replace(/\r/g, "");
  }

  return text.replace(/\s+/g, " ");
}
