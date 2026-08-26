import MarkdownIt from "markdown-it";

type PdfPageSize = "A4" | "Letter" | "Auto";

type PdfRenderOptions = {
  htmlBody: string;
  fontFamily: string;
  pageSize?: PdfPageSize;
  title?: string;
};

const markdown = new MarkdownIt({
  // Soft line breaks in Markdown are spaces, not forced visual line breaks.
  // Enabling `breaks` made prose that was wrapped in the source file appear
  // as a stack of short, misaligned lines in the generated PDF.
  breaks: false,
  linkify: true,
  typographer: true,
  html: false,
});

const defaultMarkdownLinkValidator = markdown.validateLink.bind(markdown);
markdown.validateLink = (url: string) =>
  /^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(url) || defaultMarkdownLinkValidator(url);

const PDF_MARGIN_PT = 40;
const CSS_PX_PER_PT = 96 / 72;
const PDF_RENDER_SCALE = 2;

// These are the actual PDF page dimensions in points. Keeping the DOM width
// aligned with the printable PDF width prevents the renderer from reflowing
// each line while it is being added to the PDF.
const PAGE_DIMENSIONS_PT: Record<Exclude<PdfPageSize, "Auto">, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
};

function printableWidthPx(pageSize: PdfPageSize): number {
  if (pageSize === "Auto") return 794;
  const [pageWidth] = PAGE_DIMENSIONS_PT[pageSize];
  return Math.floor((pageWidth - PDF_MARGIN_PT * 2) * CSS_PX_PER_PT);
}

export function markdownToHtml(mdText: string): string {
  return markdown.render(mdText);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function textToHtml(text: string): string {
  return `<pre class="plain-text">${escapeHtml(text)}</pre>`;
}

export function htmlDocumentToBody(htmlText: string): string {
  if (typeof DOMParser === "undefined") return htmlText;

  const parsed = new DOMParser().parseFromString(htmlText, "text/html");
  sanitizeDocument(parsed);
  return parsed.body?.innerHTML?.trim() || "";
}

export function htmlToPlainText(htmlText: string): string {
  if (!htmlText.trim()) return "";
  if (typeof DOMParser === "undefined") {
    return htmlText
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim();
  }

  const parsed = new DOMParser().parseFromString(htmlText, "text/html");
  sanitizeDocument(parsed);
  const body = parsed.body;

  body.querySelectorAll("br").forEach((element) => element.replaceWith("\n"));
  body.querySelectorAll("td, th").forEach((element) => element.append("\t"));
  body.querySelectorAll("li").forEach((element) => {
    element.prepend("• ");
    element.append("\n");
  });
  body.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, tr, blockquote, pre, hr").forEach((element) => {
    element.append("\n");
  });

  return (body.textContent || "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function markdownToPlainText(markdownText: string): string {
  return htmlToPlainText(markdownToHtml(markdownText));
}

export function buildPdfHtml(htmlBody: string, fontFamily: string, title = "Document"): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>${getPdfStyles(fontFamily)}</style>
</head>
<body class="convertlab-pdf-canvas">
  <main class="convertlab-pdf-root">${htmlBody}</main>
</body>
</html>`;
}

export async function renderHtmlToPdfBlob({
  htmlBody,
  fontFamily,
  pageSize = "A4",
  title = "Document",
}: PdfRenderOptions): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("PDF rendering is only available in the browser.");
  }

  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;
  if (typeof window !== "undefined") {
    (window as Window & { html2canvas?: unknown }).html2canvas = html2canvas;
  }
  if (typeof global !== "undefined") {
    (global as typeof global & { html2canvas?: unknown }).html2canvas = html2canvas;
  }
  if (typeof globalThis !== "undefined") {
    (globalThis as typeof globalThis & { html2canvas?: unknown }).html2canvas = html2canvas;
  }

  const renderHost = document.createElement("div");
  renderHost.setAttribute("aria-hidden", "true");
  renderHost.setAttribute("data-convertlab-pdf-host", "true");
  // Keep the render tree at a real viewport coordinate. html2canvas can return
  // an empty canvas for elements positioned thousands of pixels off-screen.
  // The application shell has z-index 10, so this z-index 0 host remains behind
  // the visible UI while still participating in normal browser layout/paint.
  renderHost.style.position = "fixed";
  renderHost.style.left = "0";
  renderHost.style.top = "0";
  renderHost.style.width = `${printableWidthPx(pageSize)}px`;
  renderHost.style.pointerEvents = "none";
  renderHost.style.zIndex = "0";
  renderHost.style.visibility = "visible";
  renderHost.style.overflow = "visible";
  // Force the browser to promote this element to its own compositing layer so
  // it is always rasterised — even when it sits behind the opaque application
  // shell. Without this, some browsers skip painting z-index-0 layers that are
  // fully covered by higher siblings, leaving html2canvas with a blank bitmap.
  renderHost.style.willChange = "transform";

  const container = document.createElement("div");
  container.className = "convertlab-pdf-canvas";
  container.setAttribute("data-convertlab-pdf-canvas", "true");
  container.style.width = `${printableWidthPx(pageSize)}px`;
  container.style.minHeight = "1px";
  container.style.background = "#ffffff";
  container.innerHTML = `
    <style>${getPdfStyles(fontFamily)}</style>
    <main class="convertlab-pdf-root" data-title="${escapeHtml(title)}">${htmlBody}</main>
  `;

  renderHost.appendChild(container);
  document.body.appendChild(renderHost);

  try {
    if (typeof document.fonts?.ready !== "undefined") {
      await document.fonts.ready;
    }
    // Images can change paragraph and table geometry after the initial layout.
    // Decode them first so the PDF snapshot uses the final document positions.
    await waitForImages(container);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    // Record text-line and block boundaries before rasterizing. Page slices can
    // then end in whitespace instead of cutting through a line of text.
    const safeBreakPoints = collectSafeBreakPoints(container);
    const contentRoot = container.querySelector<HTMLElement>(".convertlab-pdf-root");
    const captureDocument = (target: HTMLElement = container) => html2canvas(target, {
      scale: PDF_RENDER_SCALE,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: container.scrollWidth,
      height: container.scrollHeight,
      windowWidth: Math.max(container.scrollWidth, window.innerWidth),
      windowHeight: Math.max(container.scrollHeight, window.innerHeight),
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 5000,
      onclone: (clonedDocument) => {
        // Ensure application styles/scroll position cannot move or hide the
        // dedicated PDF tree inside html2canvas's cloned document.
        const clonedHost = clonedDocument.querySelector<HTMLElement>("[data-convertlab-pdf-host]");
        if (clonedHost) {
          clonedHost.style.position = "absolute";
          clonedHost.style.left = "0";
          clonedHost.style.top = "0";
          clonedHost.style.zIndex = "2147483647";
          clonedHost.style.display = "block";
          clonedHost.style.opacity = "1";
          clonedHost.style.visibility = "visible";
          clonedHost.style.transform = "none";
          clonedHost.style.willChange = "auto";
          // Ensure no ancestor clips or hides the host in the cloned document.
          let ancestor = clonedHost.parentElement;
          while (ancestor && ancestor !== clonedDocument.documentElement) {
            ancestor.style.overflow = "visible";
            ancestor.style.display = ancestor.style.display === "none" ? "block" : ancestor.style.display;
            ancestor.style.visibility = "visible";
            ancestor.style.opacity = "1";
            ancestor = ancestor.parentElement;
          }
        }
        const clonedCanvas = clonedDocument.querySelector<HTMLElement>("[data-convertlab-pdf-canvas]");
        if (clonedCanvas) {
          clonedCanvas.style.display = "block";
          clonedCanvas.style.opacity = "1";
          clonedCanvas.style.visibility = "visible";
          clonedCanvas.style.transform = "none";
          clonedCanvas.style.overflow = "visible";
        }
      },
    });

    let canvas = await captureDocument();
    let actualScale = PDF_RENDER_SCALE;
    const expectsVisibleContent = Boolean(
      contentRoot?.textContent?.trim() || contentRoot?.querySelector("img, hr, table, pre, blockquote"),
    );

    // Never package a known-empty renderer result as a successful PDF. Retry
    // above the app once in case a browser's compositor skipped the background
    // render layer, then fail clearly instead of downloading a blank document.
    if (expectsVisibleContent && isCanvasVisuallyBlank(canvas)) {
      renderHost.style.zIndex = "2147483646";
      await new Promise((resolve) => requestAnimationFrame(resolve));
      canvas = await captureDocument(contentRoot || container);
    }
    // Final retry: use allowTaint so cross-origin images don't blank the canvas,
    // and fall back to scale 1 in case the 2× bitmap overflows browser limits.
    if (expectsVisibleContent && isCanvasVisuallyBlank(canvas)) {
      actualScale = 1;
      canvas = await html2canvas(contentRoot || container, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: container.scrollWidth,
        height: container.scrollHeight,
        windowWidth: Math.max(container.scrollWidth, window.innerWidth),
        windowHeight: Math.max(container.scrollHeight, window.innerHeight),
        scrollX: 0,
        scrollY: 0,
        imageTimeout: 8000,
        onclone: (clonedDocument) => {
          const clonedHost = clonedDocument.querySelector<HTMLElement>("[data-convertlab-pdf-host]");
          if (clonedHost) {
            clonedHost.style.position = "absolute";
            clonedHost.style.left = "0";
            clonedHost.style.top = "0";
            clonedHost.style.zIndex = "2147483647";
            clonedHost.style.display = "block";
            clonedHost.style.opacity = "1";
            clonedHost.style.visibility = "visible";
            clonedHost.style.transform = "none";
          }
          const clonedCanvas = clonedDocument.querySelector<HTMLElement>("[data-convertlab-pdf-canvas]");
          if (clonedCanvas) {
            clonedCanvas.style.display = "block";
            clonedCanvas.style.opacity = "1";
            clonedCanvas.style.visibility = "visible";
            clonedCanvas.style.transform = "none";
          }
        },
      });
    }
    if (expectsVisibleContent && isCanvasVisuallyBlank(canvas)) {
      throw new Error("The PDF renderer could not capture the document content. Please try again in this browser.");
    }

    const renderedWidthPt = canvas.width / (actualScale * CSS_PX_PER_PT);
    const renderedHeightPt = canvas.height / (actualScale * CSS_PX_PER_PT);
    const isAutoSize = pageSize === "Auto";
    const [pageWidthPt, pageHeightPt] = isAutoSize
      ? [renderedWidthPt + PDF_MARGIN_PT * 2, renderedHeightPt + PDF_MARGIN_PT * 2]
      : PAGE_DIMENSIONS_PT[pageSize];
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [pageWidthPt, pageHeightPt],
      compress: true,
    });

    const availableWidthPt = pageWidthPt - PDF_MARGIN_PT * 2;
    const availableHeightPt = pageHeightPt - PDF_MARGIN_PT * 2;
    const scaleToPdf = availableWidthPt / renderedWidthPt;
    const cssPageHeight = Math.max(1, (availableHeightPt / scaleToPdf) * CSS_PX_PER_PT);
    const contentHeightCss = container.scrollHeight;
    const canvasPixelsPerCssPixel = canvas.height / contentHeightCss;
    let sourceCssY = 0;
    let pageNumber = 0;

    // Slice one fully laid-out snapshot. Unlike jsPDF's HTML auto-pager, every
    // page has one stable x-position and scale, so glyphs cannot be reflowed or
    // overprinted. Safe break points keep normal paragraphs between lines.
    while (sourceCssY < contentHeightCss - 0.5) {
      const targetCssY = Math.min(sourceCssY + cssPageHeight, contentHeightCss);
      const endCssY = isAutoSize
        ? contentHeightCss
        : chooseSafePageEnd(sourceCssY, targetCssY, safeBreakPoints, contentHeightCss);
      const sourceY = Math.max(0, Math.round(sourceCssY * canvasPixelsPerCssPixel));
      const endY = Math.min(canvas.height, Math.max(sourceY + 1, Math.round(endCssY * canvasPixelsPerCssPixel)));
      const sliceHeight = endY - sourceY;
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const context = pageCanvas.getContext("2d");
      if (!context) throw new Error("Canvas is not supported by this browser.");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      if (pageNumber > 0) pdf.addPage([pageWidthPt, pageHeightPt]);
      pdf.addImage(
        pageCanvas.toDataURL("image/png"),
        "PNG",
        PDF_MARGIN_PT,
        PDF_MARGIN_PT,
        availableWidthPt,
        (sliceHeight / (actualScale * CSS_PX_PER_PT)) * scaleToPdf,
        undefined,
        "FAST",
      );
      sourceCssY = endCssY;
      pageNumber += 1;
    }

    return pdf.output("blob");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate PDF.";
    throw new Error(message);
  } finally {
    renderHost.remove();
  }
}

function isCanvasVisuallyBlank(canvas: HTMLCanvasElement): boolean {
  if (!canvas.width || !canvas.height) return true;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return false;

  try {
    // Sample several strips from the canvas at native resolution. The old
    // approach downscaled the entire canvas to 160 × 160, which crushed tall
    // canvases so aggressively that body-text pixels (e.g. 28 px at 2× scale
    // on a 6000-px-tall canvas → ≈ 0.75 px in the sample) disappeared,
    // falsely flagging real content as blank.
    const STRIP_HEIGHT = 80;
    const sampleWidth = Math.min(640, canvas.width);
    const sample = document.createElement("canvas");
    sample.width = sampleWidth;
    sample.height = STRIP_HEIGHT;
    const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
    if (!sampleCtx) return false;

    const isNonWhite = (r: number, g: number, b: number, a: number) =>
      a > 0 && (r < 248 || g < 248 || b < 248);

    // Vertical positions to check: top, upper-quarter, center, and
    // lower-quarter of the canvas. Each reads a full-width strip at native
    // resolution so text is never downscaled below 1 px.
    const fractionals = [0, 0.25, 0.5, 0.75];
    for (const frac of fractionals) {
      const sourceY = Math.min(
        Math.floor(canvas.height * frac),
        Math.max(0, canvas.height - STRIP_HEIGHT),
      );

      sampleCtx.fillStyle = "#ffffff";
      sampleCtx.fillRect(0, 0, sampleWidth, STRIP_HEIGHT);
      sampleCtx.drawImage(
        canvas,
        0, sourceY, canvas.width, STRIP_HEIGHT,
        0, 0, sampleWidth, STRIP_HEIGHT,
      );

      const pixels = sampleCtx.getImageData(0, 0, sampleWidth, STRIP_HEIGHT).data;
      for (let i = 0; i < pixels.length; i += 4) {
        if (isNonWhite(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])) {
          return false;
        }
      }
    }

    return true;
  } catch {
    // Cross-origin image restrictions can make pixel inspection unavailable;
    // html2canvas can still provide a valid canvas for jsPDF in that case.
    return false;
  }
}

function sanitizeDocument(parsed: Document): void {
  parsed.querySelectorAll("script, style, iframe, object, embed, link, meta[http-equiv]").forEach((element) => element.remove());
  parsed.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      if (/^on/i.test(attribute.name) || attribute.name.toLowerCase() === "srcdoc") {
        element.removeAttribute(attribute.name);
      }
      if ((attribute.name === "href" || attribute.name === "src") && /^javascript:/i.test(attribute.value.trim())) {
        element.removeAttribute(attribute.name);
      }
    });
  });
}

async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(images.map(async (image) => {
    if (image.complete) {
      try {
        await image.decode?.();
      } catch {
        // A broken or cross-origin image should not prevent text conversion.
      }
      return;
    }

    await new Promise<void>((resolve) => {
      const finish = () => resolve();
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
      window.setTimeout(finish, 3000);
    });
  }));
}

function collectSafeBreakPoints(container: HTMLElement): number[] {
  const containerTop = container.getBoundingClientRect().top;
  const points = new Set<number>();
  const addPoint = (bottom: number) => {
    const value = bottom - containerTop + 2;
    if (value > 0 && value < container.scrollHeight) points.add(Math.round(value * 10) / 10);
  };

  container.querySelectorAll("p, li, pre, blockquote, tr, img, hr, h1, h2, h3, h4, h5, h6").forEach((element) => {
    addPoint(element.getBoundingClientRect().bottom);
  });

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();
  while (currentNode) {
    if (currentNode.textContent?.trim()) {
      const range = document.createRange();
      range.selectNodeContents(currentNode);
      Array.from(range.getClientRects()).forEach((rectangle) => addPoint(rectangle.bottom));
      range.detach();
    }
    currentNode = walker.nextNode();
  }

  return Array.from(points).sort((left, right) => left - right);
}

function chooseSafePageEnd(
  start: number,
  target: number,
  breakPoints: number[],
  contentHeight: number,
): number {
  if (target >= contentHeight) return contentHeight;

  // Do not leave mostly blank pages just to avoid splitting a very tall block.
  const earliestUsefulBreak = start + (target - start) * 0.62;
  let selected = 0;
  for (const point of breakPoints) {
    if (point > target - 4) break;
    if (point >= earliestUsefulBreak) selected = point;
  }
  return selected > start + 1 ? selected : target;
}

function getPdfStyles(fontFamily: string): string {
  return `
    .convertlab-pdf-canvas,
    .convertlab-pdf-canvas * { box-sizing: border-box; }
    .convertlab-pdf-canvas {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: ${fontFamily};
      font-kerning: normal;
      letter-spacing: normal;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    .convertlab-pdf-root {
      display: block;
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      padding: 0;
      color: #0f172a;
      font-family: ${fontFamily};
      font-size: 14px;
      font-weight: 400;
      line-height: 1.65;
      text-align: left;
      white-space: normal;
      word-break: normal;
      overflow-wrap: break-word;
    }
    .convertlab-pdf-root h1,
    .convertlab-pdf-root h2,
    .convertlab-pdf-root h3,
    .convertlab-pdf-root h4,
    .convertlab-pdf-root h5,
    .convertlab-pdf-root h6 {
      color: #020617;
      font-weight: 700;
      line-height: 1.25;
      margin: 1.25em 0 0.55em;
      page-break-after: avoid;
      break-after: avoid-page;
    }
    .convertlab-pdf-root h1 {
      font-size: 26px;
      font-weight: 800;
      border-bottom: 2px solid #06b6d4;
      padding-bottom: 10px;
      margin-top: 0;
    }
    .convertlab-pdf-root h2 { font-size: 21px; }
    .convertlab-pdf-root h3 { font-size: 17px; }
    .convertlab-pdf-root p,
    .convertlab-pdf-root ul,
    .convertlab-pdf-root ol,
    .convertlab-pdf-root pre,
    .convertlab-pdf-root blockquote,
    .convertlab-pdf-root table {
      margin: 0 0 14px;
    }
    .convertlab-pdf-root p {
      min-height: 1em;
      orphans: 3;
      widows: 3;
    }
    .convertlab-pdf-root ul,
    .convertlab-pdf-root ol {
      padding-left: 26px;
    }
    .convertlab-pdf-root ul { list-style: disc outside; }
    .convertlab-pdf-root ol { list-style: decimal outside; }
    .convertlab-pdf-root ul ul { list-style-type: circle; }
    .convertlab-pdf-root li {
      display: list-item;
      padding-left: 2px;
    }
    .convertlab-pdf-root li + li {
      margin-top: 5px;
    }
    .convertlab-pdf-root a {
      color: #0891b2;
      text-decoration: underline;
    }
    .convertlab-pdf-root strong {
      color: #0f172a;
      font-weight: 700;
    }
    .convertlab-pdf-root em {
      font-style: italic;
    }
    .convertlab-pdf-root code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
      font-size: 12px;
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
    }
    .convertlab-pdf-root pre {
      white-space: pre-wrap;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
      overflow: hidden;
    }
    .convertlab-pdf-root pre code {
      background: transparent;
      padding: 0;
      border-radius: 0;
    }
    .convertlab-pdf-root blockquote {
      border-left: 4px solid #06b6d4;
      padding: 0 0 0 14px;
      color: #334155;
    }
    .convertlab-pdf-root hr {
      border: 0;
      border-top: 1px solid #cbd5e1;
      margin: 24px 0;
    }
    .convertlab-pdf-root img {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 12px 0;
      border-radius: 8px;
    }
    .convertlab-pdf-root table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .convertlab-pdf-root th,
    .convertlab-pdf-root td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    .convertlab-pdf-root th {
      background: #f8fafc;
      font-weight: 700;
    }
    .convertlab-pdf-root .plain-text {
      white-space: pre-wrap;
      font-family: inherit;
      background: transparent;
      border: 0;
      padding: 0;
      margin: 0;
    }
  `;
}
