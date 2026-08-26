/**
 * Convert a JSON sample into type definitions for various languages.
 * Each function infers the structure from the JSON and produces idiomatic output.
 */

function toPascalCase(str: string): string {
  return str.replace(/(^|[-_\s])([a-z])/g, (_, _sep, c) => c.toUpperCase());
}

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
}

function inferType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "any[]";
    const types = new Set(value.map(inferType));
    return types.size === 1 ? `${Array.from(types)[0]}[]` : "any[]";
  }
  switch (typeof value) {
    case "string": return "string";
    case "number": return Number.isInteger(value) ? "integer" : "number";
    case "boolean": return "boolean";
    case "object": return "object";
    default: return "any";
  }
}

function collectObjectTypes(json: unknown, name: string, types: Map<string, Record<string, string>>) {
  if (typeof json !== "object" || json === null || Array.isArray(json)) return;
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(json)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const nestedName = toPascalCase(key);
      fields[key] = nestedName;
      if (!types.has(nestedName)) {
        types.set(nestedName, {});
        collectObjectTypes(value, nestedName, types);
      }
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
      const nestedName = toPascalCase(key).replace(/s$/, "");
      fields[key] = `${nestedName}[]`;
      if (!types.has(nestedName)) {
        types.set(nestedName, {});
        collectObjectTypes(value[0], nestedName, types);
      }
    } else {
      fields[key] = inferType(value);
    }
  }
  types.set(name, { ...types.get(name), ...fields });
}

export function jsonToPython(input: string, rootName = "Root"): string {
  const json = JSON.parse(input);
  const types = new Map<string, Record<string, string>>();
  types.set(rootName, {});
  collectObjectTypes(json, rootName, types);

  const lines: string[] = ["from dataclasses import dataclass", "from typing import List, Optional, Any", ""];

  for (const [name, fields] of types) {
    lines.push("@dataclass");
    lines.push(`class ${name}:`);
    if (Object.keys(fields).length === 0) {
      lines.push("    pass");
    } else {
      for (const [key, type] of Object.entries(fields)) {
        const pyType = mapTypeToPython(type);
        lines.push(`    ${toSnakeCase(key)}: ${pyType}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

function mapTypeToPython(type: string): string {
  if (type.endsWith("[]")) return `List[${mapTypeToPython(type.slice(0, -2))}]`;
  switch (type) {
    case "string": return "str";
    case "integer": return "int";
    case "number": return "float";
    case "boolean": return "bool";
    case "null": return "None";
    case "any": return "Any";
    default: return type; // object type reference
  }
}

export function jsonToGo(input: string, rootName = "Root"): string {
  const json = JSON.parse(input);
  const types = new Map<string, Record<string, string>>();
  types.set(rootName, {});
  collectObjectTypes(json, rootName, types);

  const lines: string[] = ["package main", ""];

  for (const [name, fields] of types) {
    lines.push(`type ${name} struct {`);
    for (const [key, type] of Object.entries(fields)) {
      const goType = mapTypeToGo(type);
      const fieldName = toPascalCase(key);
      lines.push(`\t${fieldName} ${goType} \`json:"${key}"\``);
    }
    lines.push("}");
    lines.push("");
  }
  return lines.join("\n");
}

function mapTypeToGo(type: string): string {
  if (type.endsWith("[]")) return `[]${mapTypeToGo(type.slice(0, -2))}`;
  switch (type) {
    case "string": return "string";
    case "integer": return "int";
    case "number": return "float64";
    case "boolean": return "bool";
    case "null": return "interface{}";
    case "any": return "interface{}";
    default: return type;
  }
}

export function jsonToCSharp(input: string, rootName = "Root"): string {
  const json = JSON.parse(input);
  const types = new Map<string, Record<string, string>>();
  types.set(rootName, {});
  collectObjectTypes(json, rootName, types);

  const lines: string[] = ["using System;", "using System.Collections.Generic;", ""];

  for (const [name, fields] of types) {
    lines.push(`public class ${name}`);
    lines.push("{");
    for (const [key, type] of Object.entries(fields)) {
      const csType = mapTypeToCSharp(type);
      const propName = toPascalCase(key);
      lines.push(`    public ${csType} ${propName} { get; set; }`);
    }
    lines.push("}");
    lines.push("");
  }
  return lines.join("\n");
}

function mapTypeToCSharp(type: string): string {
  if (type.endsWith("[]")) return `List<${mapTypeToCSharp(type.slice(0, -2))}>`;
  switch (type) {
    case "string": return "string";
    case "integer": return "int";
    case "number": return "double";
    case "boolean": return "bool";
    case "null": return "object";
    case "any": return "object";
    default: return type;
  }
}

export function jsonToJava(input: string, rootName = "Root"): string {
  const json = JSON.parse(input);
  const types = new Map<string, Record<string, string>>();
  types.set(rootName, {});
  collectObjectTypes(json, rootName, types);

  const lines: string[] = ["import java.util.List;", ""];

  for (const [name, fields] of types) {
    lines.push(`public class ${name} {`);
    for (const [key, type] of Object.entries(fields)) {
      const javaType = mapTypeToJava(type);
      const fieldName = toSnakeCase(key);
      lines.push(`    private ${javaType} ${fieldName};`);
    }
    lines.push("");
    for (const [key, type] of Object.entries(fields)) {
      const javaType = mapTypeToJava(type);
      const fieldName = toSnakeCase(key);
      const capName = toPascalCase(key);
      lines.push(`    public ${javaType} get${capName}() { return ${fieldName}; }`);
      lines.push(`    public void set${capName}(${javaType} ${fieldName}) { this.${fieldName} = ${fieldName}; }`);
    }
    lines.push("}");
    lines.push("");
  }
  return lines.join("\n");
}

function mapTypeToJava(type: string): string {
  if (type.endsWith("[]")) return `List<${mapTypeToJava(type.slice(0, -2))}>`;
  switch (type) {
    case "string": return "String";
    case "integer": return "int";
    case "number": return "double";
    case "boolean": return "boolean";
    case "null": return "Object";
    case "any": return "Object";
    default: return type;
  }
}

export function jsonToSql(input: string, rootName = "root"): string {
  const json = JSON.parse(input);
  if (Array.isArray(json)) {
    if (json.length === 0) return `-- Cannot infer schema from empty array\nCREATE TABLE ${toSnakeCase(rootName)} (\n    id SERIAL PRIMARY KEY\n);`;
    return generateSqlTable(toSnakeCase(rootName), json[0]);
  }
  if (typeof json === "object" && json !== null) {
    return generateSqlTable(toSnakeCase(rootName), json);
  }
  throw new Error("JSON must be an object or array of objects to generate SQL.");
}

function generateSqlTable(tableName: string, obj: Record<string, unknown>): string {
  const columns: string[] = ["    id SERIAL PRIMARY KEY"];
  const nestedTables: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const colName = toSnakeCase(key);
    if (Array.isArray(value)) {
      // Skip arrays for main table, note in comment
      columns.push(`    -- ${colName}: array type (use a join table)`);
    } else if (typeof value === "object" && value !== null) {
      columns.push(`    ${colName}_id INTEGER REFERENCES ${toSnakeCase(key)}(id)`);
      nestedTables.push(generateSqlTable(toSnakeCase(key), value as Record<string, unknown>));
    } else {
      columns.push(`    ${colName} ${mapTypeToSql(value)}`);
    }
  }

  const result = [`CREATE TABLE ${tableName} (\n${columns.join(",\n")}\n);`];
  for (const nested of nestedTables) {
    result.unshift(nested);
  }
  return result.join("\n\n");
}

function mapTypeToSql(value: unknown): string {
  if (typeof value === "string") return "VARCHAR(255)";
  if (typeof value === "number") return Number.isInteger(value) ? "INTEGER" : "DOUBLE PRECISION";
  if (typeof value === "boolean") return "BOOLEAN";
  return "TEXT";
}
