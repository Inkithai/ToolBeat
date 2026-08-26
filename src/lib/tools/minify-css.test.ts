import { describe, expect, it } from "vitest";
import { minifyCss } from "./minify-css";

describe("minifyCss", () => {
  it("strips comments and collapses whitespace", () => {
    expect(
      minifyCss(`
      /* header */
      .card {
        color: red;
        margin: 0 auto;
      }
    `),
    ).toBe(".card{color:red;margin:0 auto}");
  });

  it("drops the trailing semicolon before a closing brace", () => {
    expect(minifyCss("a{color:red;}")).toBe("a{color:red}");
  });

  it("shortens hex colors", () => {
    expect(minifyCss("a{color:#ffcc00}")).toBe("a{color:#fc0}");
    expect(minifyCss("a{color:#FFCC00FF}")).toBe("a{color:#fc0f}");
    expect(minifyCss("a{color:#123456}")).toBe("a{color:#123456}");
  });

  it("removes zero units", () => {
    expect(minifyCss("a{margin:0px;padding:0em;border:0px solid red}")).toBe(
      "a{margin:0;padding:0;border:0 solid red}",
    );
    // 10px must survive — only standalone zeros shrink.
    expect(minifyCss("a{margin:10px}")).toBe("a{margin:10px}");
    expect(minifyCss("a{font-size:1.0px}")).toBe("a{font-size:1.0px}");
  });

  it("removes empty rules, including nested ones", () => {
    expect(minifyCss("a{} b{color:red}")).toBe("b{color:red}");
    expect(minifyCss("@media screen{a{color:red} b{}}")).toBe("@media screen{a{color:red}}");
    expect(minifyCss("@media screen{a{}} b{color:red}")).toBe("b{color:red}");
  });

  it("keeps content strings intact", () => {
    expect(minifyCss('a{content:"/* not a comment */"}')).toBe('a{content:"/* not a comment */"}');
    // The space between `}` and the next selector is dropped — it is
    // insignificant CSS — but the string content itself is untouched.
    expect(minifyCss("a{content:'x} y'} b{color:red}")).toBe("a{content:'x} y'}b{color:red}");
  });

  it("keeps calc() spacing and quoted braces safe", () => {
    expect(minifyCss("a{width:calc(100% - 10px)}")).toBe("a{width:calc(100% - 10px)}");
  });

  it("keeps at-rules and multiple declarations", () => {
    expect(minifyCss("@import 'x.css';@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}")).toBe(
      "@import 'x.css';@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}",
    );
  });

  it("rejects unterminated comments and strings", () => {
    expect(() => minifyCss("a{color:red/* oops")).toThrow(/unterminated comment/);
    expect(() => minifyCss('a{content:"oops}')).toThrow(/unterminated string/);
  });

  it("does not double-minify", () => {
    const once = minifyCss("a { color:  #ffcc00 ; }");
    expect(minifyCss(once)).toBe(once);
  });
});
