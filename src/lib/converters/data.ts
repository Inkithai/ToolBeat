import yaml from "js-yaml";
import Papa from "papaparse";
import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";

type CsvRow = Record<string, string>;

export function jsonToYaml(jsonStr: string): string {
  return yaml.dump(parseJson(jsonStr), { noRefs: true, lineWidth: -1 });
}

export function yamlToJson(yamlStr: string): string {
  const value = yaml.load(yamlStr);
  if (typeof value === "undefined") {
    throw new Error("YAML input is empty.");
  }
  return JSON.stringify(value, null, 2);
}

export function csvToJson(csvStr: string): string {
  const parsed = parseCsv<CsvRow>(csvStr, { header: true });
  const headers = parsed.meta.fields?.filter((header) => header.trim()) ?? [];
  if (!headers.length) throw new Error("CSV must include a header row.");
  if (new Set(headers).size !== headers.length) throw new Error("CSV header names must be unique.");

  return JSON.stringify(parsed.data, null, 2);
}

export function jsonToCsv(jsonStr: string): string {
  const data = parseJson(jsonStr);
  if (!Array.isArray(data)) {
    throw new Error("JSON to CSV requires an array of objects.");
  }
  if (!data.every((row) => row !== null && typeof row === "object" && !Array.isArray(row))) {
    throw new Error("Each JSON array item must be an object.");
  }

  return Papa.unparse(data);
}

export function csvToMarkdown(csvStr: string): string {
  const parsed = parseCsv<string[]>(csvStr);
  const rows = (parsed.data as unknown as string[][])
    .filter((row) => row.some((cell) => String(cell ?? "").trim().length > 0));
  if (!rows.length) throw new Error("CSV input is empty.");

  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const normalizedRows = rows.map((row) =>
    Array.from({ length: columnCount }, (_, index) => escapeMarkdownTableCell(row[index] ?? ""))
  );
  const [header, ...body] = normalizedRows;
  const separator = Array.from({ length: columnCount }, () => "---");

  return [
    `| ${header.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

export function markdownToCsv(markdownText: string): string {
  if (!markdownText.trim()) throw new Error("Markdown input is empty.");

  const lines = markdownText.replace(/\r\n?/g, "\n").split("\n");
  for (let index = 0; index < lines.length - 1; index += 1) {
    const header = splitMarkdownTableRow(lines[index]);
    const divider = splitMarkdownTableRow(lines[index + 1]);
    if (header.length < 2 || divider.length !== header.length || !divider.every(isTableDivider)) continue;

    const rows = [header];
    for (let rowIndex = index + 2; rowIndex < lines.length; rowIndex += 1) {
      const row = splitMarkdownTableRow(lines[rowIndex]);
      if (!row.length) break;
      rows.push(Array.from({ length: header.length }, (_, column) => row[column] ?? ""));
    }

    return Papa.unparse(rows);
  }

  throw new Error("No Markdown table was found. Include a header and a separator row such as | --- | --- |.");
}

export function jsonToXml(jsonStr: string): string {
  const data = parseJson(jsonStr);
  // XML must have exactly one document element. Wrapping the input also keeps
  // top-level JSON arrays from becoming several invalid sibling root nodes.
  const documentValue = {
    root: Array.isArray(data) ? { item: data } : data,
  };
  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    suppressEmptyNode: false,
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(documentValue)}`;
}

export function xmlToJson(xmlStr: string): string {
  if (!xmlStr.trim()) throw new Error("XML input is empty.");
  const validation = XMLValidator.validate(xmlStr);
  if (validation !== true) {
    const detail = validation.err?.msg ? `: ${validation.err.msg}` : ".";
    throw new Error(`Invalid XML${detail}`);
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    ignoreDeclaration: true,
    attributeNamePrefix: "@_",
    trimValues: true,
    parseTagValue: true,
    parseAttributeValue: true,
  });
  return JSON.stringify(parser.parse(xmlStr), null, 2);
}

function parseJson(input: string): unknown {
  if (!input.trim()) throw new Error("JSON input is empty.");
  return JSON.parse(input);
}

function parseCsv<T>(input: string, options: Record<string, unknown> = {}) {
  if (!input.trim()) throw new Error("CSV input is empty.");
  const parsed = Papa.parse<T>(input, { skipEmptyLines: "greedy", ...options });
  if (parsed.errors.length) {
    const firstError = parsed.errors[0] as { message?: string };
    throw new Error(`Invalid CSV${firstError.message ? `: ${firstError.message}` : " input."}`);
  }
  return parsed;
}

function escapeMarkdownTableCell(value: string): string {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>")
    .trim();
}

function splitMarkdownTableRow(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.includes("|")) return [];

  const content = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cell = "";
  let escaped = false;

  for (const character of content) {
    if (escaped) {
      cell += character;
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (character === "|") {
      cells.push(cleanMarkdownTableCell(cell));
      cell = "";
    } else {
      cell += character;
    }
  }
  if (escaped) cell += "\\";
  cells.push(cleanMarkdownTableCell(cell));
  return cells;
}

function cleanMarkdownTableCell(value: string): string {
  return value
    .trim()
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1");
}

function isTableDivider(value: string): boolean {
  return /^:?-{3,}:?$/.test(value.replace(/\s/g, ""));
}
