import { describe, expect, it } from "vitest";
import { jsonToTypeScript } from "./json-to-ts";

describe("jsonToTypeScript", () => {
  it("types a flat object", () => {
    const output = jsonToTypeScript(JSON.stringify({ id: 1, name: "x", active: true }), "User");
    expect(output).toContain("export type User = {");
    expect(output).toContain("id: number;");
    expect(output).toContain("name: string;");
    expect(output).toContain("active: boolean;");
  });

  it("names nested objects from their key path", () => {
    const data = { meta: { count: 1, deep: { flag: false } } };
    const output = jsonToTypeScript(JSON.stringify(data), "Root");
    expect(output).toContain("type RootMeta = {");
    expect(output).toContain("type RootMetaDeep = {");
    expect(output).toContain("meta: RootMeta;");
    expect(output).toContain("deep: RootMetaDeep;");
  });

  it("types arrays of objects with a shared element type", () => {
    const data = { users: [{ id: 1 }, { id: 2 }] };
    const output = jsonToTypeScript(JSON.stringify(data), "Root");
    expect(output).toContain("type RootUsers = {");
    expect(output).toContain("users: RootUsers[];");
  });

  it("types primitive and mixed arrays", () => {
    expect(jsonToTypeScript("[1,2]", "Root")).toContain("export type Root = number[];");
    expect(jsonToTypeScript('["a", 1]', "Root")).toContain("export type Root = (string | number)[];");
    expect(jsonToTypeScript("[]", "Root")).toContain("unknown[]");
    expect(jsonToTypeScript("null", "Root")).toContain("= null;");
  });

  it("quotes keys that are not safe identifiers", () => {
    const output = jsonToTypeScript(JSON.stringify({ "user-id": 1, "2fa": true, ok: 3 }), "Root");
    expect(output).toContain('"user-id": number;');
    expect(output).toContain('"2fa": boolean;');
    expect(output).toContain("ok: number;");
  });

  it("sanitizes the base name", () => {
    expect(jsonToTypeScript("{}", "my-root!")).toContain("export type MyRoot = {};");
  });

  it("throws a friendly error on invalid JSON", () => {
    expect(() => jsonToTypeScript("{nope}")).toThrow("not valid JSON");
  });

  it("returns empty output for empty input", () => {
    expect(jsonToTypeScript("   ")).toBe("");
  });
});
