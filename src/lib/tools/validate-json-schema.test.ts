import { describe, expect, it } from "vitest";
import { validateJsonAgainstSchema } from "./validate-json-schema";

const SCHEMA = JSON.stringify({
  type: "object",
  properties: {
    name: { type: "string", minLength: 2 },
    age: { type: "integer", minimum: 0 },
    site: { type: "string", format: "uri" },
  },
  required: ["name"],
  additionalProperties: false,
});

describe("validateJsonAgainstSchema", () => {
  it("accepts a conforming document", async () => {
    const result = await validateJsonAgainstSchema(
      JSON.stringify({ name: "ConvertLab", age: 3, site: "https://example.com" }),
      SCHEMA,
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("lists every violation with its path", async () => {
    const result = await validateJsonAgainstSchema(
      JSON.stringify({ age: -1, site: "not a uri", extra: true }),
      SCHEMA,
    );
    expect(result.valid).toBe(false);
    const joined = result.errors.join(" ");
    expect(joined).toMatch(/required property 'name'/);
    expect(joined).toContain("/age");
    expect(joined).toContain("/site");
    expect(joined).toMatch(/extra/);
  });

  it("reports a bad document JSON before validating", async () => {
    const result = await validateJsonAgainstSchema("{ not json", SCHEMA);
    expect(result.valid).toBe(false);
    expect(result.documentError).toMatch(/not valid JSON/);
  });

  it("reports a bad schema before validating", async () => {
    const result = await validateJsonAgainstSchema('{"name": "x"}', "{ no");
    expect(result.valid).toBe(false);
    expect(result.schemaError).toMatch(/not valid JSON/);
  });

  it("reports non-compiling schemas", async () => {
    const result = await validateJsonAgainstSchema('{"name": "x"}', JSON.stringify({ type: "definitely-not-a-type" }));
    expect(result.valid).toBe(false);
    expect(result.schemaError).toBeTruthy();
  });

  it("validates formats via ajv-formats", async () => {
    const schema = JSON.stringify({ type: "string", format: "email" });
    const ok = await validateJsonAgainstSchema('"a@b.co"', schema);
    const bad = await validateJsonAgainstSchema('"not-an-email"', schema);
    expect(ok.valid).toBe(true);
    expect(bad.valid).toBe(false);
  });

  it("handles arrays and primitives", async () => {
    const schema = JSON.stringify({ type: "array", items: { enum: ["a", "b"] }, minItems: 1 });
    expect((await validateJsonAgainstSchema('["a","b"]', schema)).valid).toBe(true);
    expect((await validateJsonAgainstSchema("[]", schema)).valid).toBe(false);
    expect((await validateJsonAgainstSchema('["c"]', schema)).valid).toBe(false);
  });
});
