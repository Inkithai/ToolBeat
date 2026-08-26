import { describe, expect, it } from "vitest";
import { generateMockData, MOCK_FIELDS, mockRowsToCsv, mockRowsToJson } from "./mock-data";

const FIELDS = ["name", "email", "phone", "company", "city", "street", "date", "amount", "uuid"] as const;

describe("generateMockData", () => {
  it("generates the requested rows and columns", () => {
    const result = generateMockData(25, [...FIELDS], 7);
    expect(result.rows).toHaveLength(25);
    expect(result.columns).toEqual([...FIELDS]);
    for (const row of result.rows) {
      for (const field of FIELDS) expect(row[field]).toBeTruthy();
    }
  });

  it("is deterministic for a fixed seed", () => {
    expect(generateMockData(10, ["name", "email"], 42)).toEqual(generateMockData(10, ["name", "email"], 42));
  });

  it("differs across seeds", () => {
    const a = generateMockData(10, ["name"], 1);
    const b = generateMockData(10, ["name"], 2);
    expect(a.rows).not.toEqual(b.rows);
  });

  it("builds plausible values", () => {
    const [row] = generateMockData(1, [...FIELDS], 3).rows;
    expect(row?.name).toMatch(/\S+ \S+/);
    expect(row?.email).toMatch(/^[a-z0-9.]+@example\.com$/i);
    expect(row?.phone).toMatch(/^\+\d-\d{3}-\d{4,5}$/);
    expect(row?.city).toBeTruthy();
    expect(row?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(row?.amount).toMatch(/^\d+\.\d{2}$/);
    expect(row?.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("rejects bad arguments", () => {
    expect(() => generateMockData(0, ["name"])).toThrow(/at least 1/);
    expect(() => generateMockData(6000, ["name"])).toThrow(/5,000/);
    expect(() => generateMockData(5, [])).toThrow(/at least one field/);
  });
});

describe("export helpers", () => {
  const result = generateMockData(3, ["name", "email"], 1);

  it("exports CSV with a header and quoting", () => {
    const csv = mockRowsToCsv(result);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("name,email");
    expect(lines).toHaveLength(4);
    for (const line of lines.slice(1)) expect(line.split(",").length).toBe(2);
  });

  it("quotes values containing commas or quotes", () => {
    const quoted = mockRowsToCsv({
      rows: [{ name: 'Smith, "Sam"', email: "s@example.com" }],
      columns: ["name", "email"],
    });
    expect(quoted).toContain('"Smith, ""Sam"""');
  });

  it("exports JSON", () => {
    const json = mockRowsToJson(result, false);
    expect(JSON.parse(json)).toHaveLength(3);
  });

  it("exposes the full field catalog", () => {
    expect(MOCK_FIELDS.map((field) => field.key)).toEqual([...FIELDS]);
  });
});
