import { describe, expect, it } from "vitest";
import { describePlatformProcessing, describePlatformProcessingShort } from "./capabilities";
import { TOOLS } from "./registry";

describe("capabilities", () => {
  it("describes platform processing for all tools", () => {
    const fullDesc = describePlatformProcessing(TOOLS);
    expect(fullDesc).toContain("browser");
    expect(typeof fullDesc).toBe("string");
  });

  it("provides short description for platform processing", () => {
    const shortDesc = describePlatformProcessingShort(TOOLS);
    expect(shortDesc).toContain("browser");
    expect(typeof shortDesc).toBe("string");
  });
});
