/**
 * Barcode rendering via JsBarcode, imported dynamically. Renders into a real
 * <svg> element (browser or jsdom) and returns the SVG markup plus dimensions.
 */

export type BarcodeFormat = "CODE128" | "CODE39" | "EAN13" | "EAN8" | "ITF14";

export const BARCODE_FORMATS: { value: BarcodeFormat; label: string; hint: string }[] = [
  { value: "CODE128", label: "Code 128", hint: "Any text — the default for most use cases" },
  { value: "CODE39", label: "Code 39", hint: "Uppercase A–Z, 0–9, space and - . $ / + %" },
  { value: "EAN13", label: "EAN-13", hint: "13 digits (retail)" },
  { value: "EAN8", label: "EAN-8", hint: "8 digits (compact retail)" },
  { value: "ITF14", label: "ITF-14", hint: "14 digits (cartons/logistics)" },
];

export type BarcodeResult = {
  svg: string;
  width: number;
  height: number;
};

export async function renderBarcode(
  value: string,
  format: BarcodeFormat,
  options: { moduleWidth?: number; height?: number; margin?: number; displayValue?: boolean } = {},
): Promise<BarcodeResult> {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Enter the value to encode first.");
  const { default: JsBarcode } = await import("jsbarcode");
  const svg = document.createElement("svg");
  try {
    JsBarcode(svg, trimmed, {
      format,
      width: options.moduleWidth ?? 1.6,
      height: options.height ?? 64,
      margin: options.margin ?? 8,
      displayValue: options.displayValue ?? true,
      font: "sans-serif",
      fontSize: 14,
      textMargin: 4,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/not a valid input|illegal character/i.test(message)) {
      throw new Error(`"${trimmed}" contains characters that ${format} cannot encode.`);
    }
    if (/expected (13|8|14) digits|invalid/i.test(message)) {
      throw new Error(`${format} needs the right number of digits for "${trimmed}".`);
    }
    throw new Error(message || `Could not render a ${format} barcode.`);
  }
  // jsbarcode writes dimensions with a "px" suffix.
  const width = Number.parseFloat(svg.getAttribute("width") ?? "") || 0;
  const height = Number.parseFloat(svg.getAttribute("height") ?? "") || 0;
  return { svg: svg.outerHTML, width, height };
}
