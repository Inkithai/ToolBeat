import { describe, expect, it } from "vitest";
import { convertCase, splitWords } from "./text-case";

describe("splitWords", () => {
  it("splits on punctuation, camelCase and acronym boundaries", () => {
    expect(splitWords("loadPDFReport-v2 final")).toEqual(["load", "PDF", "Report", "v2", "final"]);
    expect(splitWords("XMLHttpRequest")).toEqual(["XML", "Http", "Request"]);
  });

  it("returns no empty words for leading/trailing separators", () => {
    expect(splitWords("  --hello--  ")).toEqual(["hello"]);
  });
});

describe("convertCase", () => {
  const source = "the quick-start guide";

  it("upper and lower are direct", () => {
    expect(convertCase(source, "upper")).toBe("THE QUICK-START GUIDE");
    expect(convertCase("MiXeD", "lower")).toBe("mixed");
  });

  it("title case capitalizes every word", () => {
    expect(convertCase("the quick brown fox", "title")).toBe("The Quick Brown Fox");
  });

  it("sentence case capitalizes each sentence, not each word", () => {
    expect(convertCase("hello there. it is ME!", "sentence")).toBe("Hello there. It is me!");
  });

  it("programming cases rebuild words from any input", () => {
    expect(convertCase("user profile PAGE-v2", "camel")).toBe("userProfilePageV2");
    expect(convertCase("user profile PAGE-v2", "pascal")).toBe("UserProfilePageV2");
    expect(convertCase("user profile PAGE-v2", "snake")).toBe("user_profile_page_v2");
    expect(convertCase("user profile PAGE-v2", "kebab")).toBe("user-profile-page-v2");
    expect(convertCase("user profile PAGE-v2", "constant")).toBe("USER_PROFILE_PAGE_V2");
  });

  it("handles empty and separator-only input", () => {
    for (const style of ["camel", "pascal", "snake", "kebab", "constant", "title"] as const) {
      expect(convertCase("— —", style)).toBe("");
    }
  });
});
