/**
 * JSON → TypeScript type generation.
 *
 * Walks a parsed JSON value and emits `type` aliases: nested objects become
 * named types derived from their key path, arrays of objects get an element
 * type, and mixed arrays become unions. The output is intentionally simple —
 * a useful contract sketch, not a schema compiler.
 */

type Context = {
  declarations: string[];
  /** Path segments → declared type name, so shared shapes are not duplicated. */
  named: Map<string, string>;
};

export function jsonToTypeScript(jsonText: string, baseName = "Root"): string {
  if (!jsonText.trim()) return "";
  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error("That is not valid JSON.");
  }

  const context: Context = { declarations: [], named: new Map() };
  const safeName = sanitizeIdentifier(baseName) || "Root";
  const rootType = inferType(data, [safeName], safeName, context);

  if (context.declarations.length) {
    // The root object is already declared (as `export type …` — it is the
    // only declaration at path depth 1).
    return `${context.declarations.join("\n\n")}\n`;
  }
  return `export type ${safeName} = ${rootType};\n`;
}

function inferType(value: unknown, path: string[], rootName: string, context: Context): string {
  if (value === null) return "null";
  if (typeof value === "string") return "string";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return inferArray(value, path, rootName, context);
  if (typeof value === "object") return inferObject(value as Record<string, unknown>, path, rootName, context);
  return "unknown";
}

function inferArray(value: unknown[], path: string[], rootName: string, context: Context): string {
  if (!value.length) return "unknown[]";
  const elementTypes = new Set<string>();
  value.forEach((element) => elementTypes.add(inferType(element, path, rootName, context)));
  const unique = Array.from(elementTypes);
  if (unique.length === 1) return `${unique[0]}[]`;
  return `(${unique.join(" | ")})[]`;
}

function inferObject(value: Record<string, unknown>, path: string[], rootName: string, context: Context): string {
  const keyPath = path.join(".");
  const existing = context.named.get(keyPath);
  if (existing) return existing;

  const typeName = path.length === 1 ? rootName : `${rootName}${path.slice(1).map(pascalCase).join("")}`;
  context.named.set(keyPath, typeName);

  const members = Object.entries(value).map(([key, member]) => {
    const memberType = inferType(member, [...path, key], rootName, context);
    return `  ${memberKey(key)}: ${memberType};`;
  });
  const body = members.length ? `{\n${members.join("\n")}\n}` : "{}";
  // Only the root object sits at path depth 1; it is the exported type.
  const prefix = path.length === 1 ? "export type" : "type";
  context.declarations.push(`${prefix} ${typeName} = ${body};`);
  return typeName;
}

/** Keys that are not valid identifiers must be quoted in TypeScript. */
function memberKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function sanitizeIdentifier(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[^A-Za-z0-9_$]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(pascalCase)
    .join("");
  if (/^[0-9]/.test(cleaned)) return `T${cleaned}`;
  return cleaned;
}

function pascalCase(key: string): string {
  const base = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-]+/g, " ")
    .trim();
  const words = base.split(/\s+/).filter(Boolean);
  const result = words.map((word) => word[0].toUpperCase() + word.slice(1)).join("");
  return result || "Field";
}
