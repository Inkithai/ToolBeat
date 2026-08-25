import { describe, expect, it } from "vitest";
import {
  csvToJson,
  csvToMarkdown,
  jsonToCsv,
  jsonToXml,
  jsonToYaml,
  markdownToCsv,
  xmlToJson,
  yamlToJson,
} from "./data";

/**
 * These converters are the user-facing contract of six ToolBeat tools, so the
 * tests focus on the behaviour a user can actually observe: correct output for
 * valid input, and a specific, actionable error for input that cannot convert.
 * Error paths matter as much as happy paths here — a silent wrong answer in a
 * data converter is worse than a rejection.
 */

describe("jsonToYaml", () => {
  it("converts nested objects and arrays", () => {
    const yaml = jsonToYaml('{"name":"ToolBeat","tags":["a","b"],"nested":{"count":1}}');
    expect(yaml).toContain("name: ToolBeat");
    expect(yaml).toContain("- a");
    expect(yaml).toContain("count: 1");
  });

  it("quotes keys that YAML 1.1 would read as booleans", () => {
    // `n`, `y`, `on`, `off` are booleans in YAML 1.1; js-yaml quotes them so the
    // document still round-trips back to the original string key.
    expect(jsonToYaml('{"n":1}')).toContain("'n': 1");
  });

  it("does not wrap long values, so round-tripping stays lossless", () => {
    const long = "x".repeat(200);
    const yaml = jsonToYaml(JSON.stringify({ long }));
    expect(yaml).toContain(long);
  });

  it("rejects empty input", () => {
    expect(() => jsonToYaml("   ")).toThrow(/empty/i);
  });

  it("rejects malformed JSON", () => {
    expect(() => jsonToYaml("{nope}")).toThrow();
  });
});

describe("yamlToJson", () => {
  it("parses YAML into formatted JSON", () => {
    expect(JSON.parse(yamlToJson("name: ToolBeat\ncount: 2\n"))).toEqual({
      name: "ToolBeat",
      count: 2,
    });
  });

  it("round-trips with jsonToYaml", () => {
    const original = { a: 1, b: ["x", "y"], c: { d: true } };
    expect(JSON.parse(yamlToJson(jsonToYaml(JSON.stringify(original))))).toEqual(original);
  });

  it("rejects empty YAML rather than emitting undefined", () => {
    expect(() => yamlToJson("")).toThrow(/empty/i);
  });
});

describe("csvToJson", () => {
  it("maps a header row onto objects", () => {
    expect(JSON.parse(csvToJson("name,age\nAda,36\nAlan,41"))).toEqual([
      { name: "Ada", age: "36" },
      { name: "Alan", age: "41" },
    ]);
  });

  it("disambiguates duplicate headers instead of dropping a column", () => {
    // Papa Parse renames the second `a` to `a_1` before csvToJson's uniqueness
    // guard runs, so that guard is unreachable in practice. Documented here
    // because the observable behaviour — no data loss — is the thing that
    // matters to users, and a future parser swap must preserve it.
    expect(JSON.parse(csvToJson("a,a\n1,2"))).toEqual([{ a: "1", a_1: "2" }]);
  });

  it("rejects empty input", () => {
    expect(() => csvToJson("")).toThrow(/empty/i);
  });
});

describe("jsonToCsv", () => {
  it("converts an array of objects using CRLF line endings", () => {
    // RFC 4180 specifies CRLF, and Excel depends on it; asserted explicitly so
    // the line ending is not silently changed by a parser upgrade.
    expect(jsonToCsv('[{"name":"Ada","age":36}]')).toBe("name,age\r\nAda,36");
  });

  it("derives columns from the first row's keys", () => {
    expect(jsonToCsv('[{"a":1,"b":2},{"a":3,"b":4}]')).toBe("a,b\r\n1,2\r\n3,4");
  });

  it("requires an array, because a bare object has no rows", () => {
    expect(() => jsonToCsv('{"name":"Ada"}')).toThrow(/array of objects/i);
  });

  it("requires every item to be an object", () => {
    expect(() => jsonToCsv('[{"a":1},"not-an-object"]')).toThrow(/must be an object/i);
  });
});

describe("csvToMarkdown / markdownToCsv", () => {
  it("builds a Markdown table with a separator row", () => {
    const md = csvToMarkdown("name,age\nAda,36");
    const lines = md.split("\n");
    expect(lines[0]).toBe("| name | age |");
    expect(lines[1]).toBe("| --- | --- |");
    expect(lines[2]).toBe("| Ada | 36 |");
  });

  it("pads short rows so the table stays rectangular", () => {
    const md = csvToMarkdown("a,b,c\n1");
    expect(md.split("\n")[2]).toBe("| 1 |  |  |");
  });

  it("escapes pipe characters that would otherwise break the table", () => {
    expect(csvToMarkdown('col,other\n"a|b",1')).toContain("a\\|b");
  });

  it("escapes backslashes before pipes, so an escape cannot be neutralised", () => {
    expect(csvToMarkdown('col,other\n"a\\b",1')).toContain("a\\\\b");
  });

  it("converts embedded newlines to <br> to keep one row per line", () => {
    expect(csvToMarkdown('col,other\n"a\nb",1')).toContain("a<br>b");
  });

  it("round-trips CSV → Markdown → CSV", () => {
    const csv = markdownToCsv(csvToMarkdown("name,age\nAda,36"));
    expect(csv.replace(/\r\n/g, "\n").trim()).toBe("name,age\nAda,36");
  });

  it("explains what is missing when there is no table", () => {
    expect(() => markdownToCsv("Just a paragraph.")).toThrow(/no markdown table/i);
  });
});

describe("jsonToXml", () => {
  it("emits a declaration and a single root element", () => {
    const xml = jsonToXml('{"name":"ToolBeat"}');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain("<root>");
    expect(xml).toContain("<name>ToolBeat</name>");
  });

  it("wraps top-level arrays so the document stays well formed", () => {
    // Without wrapping, an array would produce sibling roots and invalid XML.
    const xml = jsonToXml('[{"a":1},{"a":2}]');
    expect(xml.match(/<root>/g)).toHaveLength(1);
    expect(xml.match(/<item>/g)).toHaveLength(2);
  });
});

describe("xmlToJson", () => {
  it("parses elements and attributes", () => {
    const parsed = JSON.parse(xmlToJson('<root><item id="1">Ada</item></root>'));
    expect(parsed.root.item["@_id"]).toBe(1);
    expect(parsed.root.item["#text"]).toBe("Ada");
  });

  it("rejects malformed XML with a reason", () => {
    expect(() => xmlToJson("<root><unclosed></root>")).toThrow(/invalid xml/i);
  });

  it("rejects empty input", () => {
    expect(() => xmlToJson("  ")).toThrow(/empty/i);
  });
});
