declare module "js-yaml" {
  export function load(input: string): unknown;
  export function loadAll(input: string): unknown[];
  export function dump(obj: unknown, options?: Record<string, unknown>): string;
}

declare module "papaparse" {
  export interface ParseResult<T> {
    data: T[];
    errors: unknown[];
    meta: { fields?: string[] };
  }
  export function parse<T = unknown>(input: string, options?: Record<string, unknown>): ParseResult<T>;
  export function unparse(data: unknown): string;
}

declare module "markdown-it" {
  export default class MarkdownIt {
    constructor(options?: Record<string, unknown>);
    render(input: string): string;
    validateLink(url: string): boolean;
  }
}

declare module "mammoth" {
  export interface MammothMessage {
    type: string;
    message: string;
  }

  export interface MammothResult {
    value: string;
    messages: MammothMessage[];
  }

  export function convertToMarkdown(
    input: { arrayBuffer: ArrayBuffer },
    options?: Record<string, unknown>
  ): Promise<MammothResult>;

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer },
    options?: Record<string, unknown>
  ): Promise<MammothResult>;
}
