import { describe, expect, it } from "vitest";
import { SQL_LANGUAGES, formatSql, sqlLanguageLabel } from "./sql-format";

describe("formatSql", () => {
  it("formats a simple query with keyword casing and indentation", () => {
    const output = formatSql("select id,name from users where active = true");
    expect(output).toContain("select");
    expect(output).toContain("from");
    expect(output).toContain("where");
    expect(output).toMatch(/\n\s+id,\s*\n\s*name/);
  });

  it("supports uppercase keywords", () => {
    const output = formatSql("select 1", { uppercase: true });
    expect(output.startsWith("SELECT")).toBe(true);
  });

  it("supports tab indentation", () => {
    const output = formatSql("select 1 from t", { useTabs: true });
    expect(output).toContain("\n\t1");
  });

  it("passes through dialect options", () => {
    const output = formatSql("select 1", { language: "mysql" });
    expect(output).toContain("1");
  });

  it("returns empty output for empty input", () => {
    expect(formatSql("   ")).toBe("");
  });

  it("offers the documented dialect list", () => {
    expect(SQL_LANGUAGES).toContain("postgresql");
    expect(SQL_LANGUAGES).toContain("sqlite");
    expect(sqlLanguageLabel("postgresql")).toBe("PostgreSQL");
  });
});
