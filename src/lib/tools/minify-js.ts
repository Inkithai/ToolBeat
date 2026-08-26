/**
 * JavaScript minification via terser, imported dynamically so the minifier
 * ships in its own chunk (only the JS Minifier page pulls it in).
 */

import type { MinifyOutput } from "terser";

type TerserResult = MinifyOutput & {
  warnings?: { file?: string; message?: string }[];
};

export type JsMinifyOptions = {
  /** Remove console.*() calls. */
  dropConsole?: boolean;
  /** "es5" for legacy targets, "es6" (default) for modern syntax. */
  target?: "es5" | "es6";
};

export type JsMinifyResult = {
  code: string;
  warnings: string[];
  inputBytes: number;
  outputBytes: number;
  reducedPct: number;
};

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

export async function minifyJs(source: string, options: JsMinifyOptions = {}): Promise<JsMinifyResult> {
  const { minify } = await import("terser");
  const inputBytes = byteLength(source);
  let result: TerserResult;
  try {
    result = (await minify(source, {
      compress: {
        drop_console: options.dropConsole ?? false,
        defaults: true,
      },
      mangle: true,
      output: {
        quote_style: 1,
        ecma: options.target === "es5" ? 5 : 2017,
      },
      ecma: options.target === "es5" ? 5 : 2020,
    })) as TerserResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cleaned = message
      .split("\n")
      .filter((line) => !line.startsWith("    at "))
      .join(" ")
      .replace(/^SYNTAX_ERROR\s*/i, "Syntax error: ")
      .trim();
    throw new Error(cleaned || "This JavaScript could not be parsed.");
  }
  const code = result.code ?? "";
  const outputBytes = byteLength(code);
  const warnings = (result.warnings ?? []).map((warning) => warning.message ?? String(warning));
  const reducedPct = inputBytes > 0 ? Math.max(0, (1 - outputBytes / inputBytes) * 100) : 0;
  return { code, warnings, inputBytes, outputBytes, reducedPct };
}
