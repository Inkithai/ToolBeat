import { describe, expect, it } from "vitest";
import { jsonToPython, jsonToGo, jsonToCSharp, jsonToJava, jsonToSql } from "./json-to-types";

const SAMPLE = JSON.stringify({ id: 1, name: "Ada", tags: ["a", "b"], active: true });

describe("jsonToPython", () => {
  it("generates Python dataclass with correct types", () => {
    const output = jsonToPython(SAMPLE);
    expect(output).toContain("from dataclasses import dataclass");
    expect(output).toContain("@dataclass");
    expect(output).toContain("class Root:");
    expect(output).toContain("id: int");
    expect(output).toContain("name: str");
    expect(output).toContain("active: bool");
    expect(output).toContain("tags: List[str]");
  });
});

describe("jsonToGo", () => {
  it("generates Go structs with JSON tags", () => {
    const output = jsonToGo(SAMPLE);
    expect(output).toContain("package main");
    expect(output).toContain("type Root struct {");
    expect(output).toContain("Id int `json:\"id\"`");
    expect(output).toContain("Name string `json:\"name\"`");
    expect(output).toContain("Active bool `json:\"active\"`");
    expect(output).toContain("Tags []string `json:\"tags\"`");
  });
});

describe("jsonToCSharp", () => {
  it("generates C# classes with auto-properties", () => {
    const output = jsonToCSharp(SAMPLE);
    expect(output).toContain("using System;");
    expect(output).toContain("public class Root");
    expect(output).toContain("public int Id { get; set; }");
    expect(output).toContain("public string Name { get; set; }");
    expect(output).toContain("public bool Active { get; set; }");
    expect(output).toContain("public List<string> Tags { get; set; }");
  });
});

describe("jsonToJava", () => {
  it("generates Java classes with getters/setters", () => {
    const output = jsonToJava(SAMPLE);
    expect(output).toContain("import java.util.List;");
    expect(output).toContain("public class Root {");
    expect(output).toContain("private int id;");
    expect(output).toContain("private String name;");
    expect(output).toContain("public int getId()");
    expect(output).toContain("public void setId(int id)");
  });
});

describe("jsonToSql", () => {
  it("generates CREATE TABLE from a flat object", () => {
    const output = jsonToSql(JSON.stringify({ id: 1, name: "Ada", price: 9.99, active: true }));
    expect(output).toContain("CREATE TABLE root");
    expect(output).toContain("id SERIAL PRIMARY KEY");
    expect(output).toContain("name VARCHAR(255)");
    expect(output).toContain("price DOUBLE PRECISION");
    expect(output).toContain("active BOOLEAN");
  });

  it("handles array inputs by using the first element", () => {
    const output = jsonToSql(JSON.stringify([{ id: 1, name: "Ada" }]));
    expect(output).toContain("CREATE TABLE root");
    expect(output).toContain("name VARCHAR(255)");
  });
});
