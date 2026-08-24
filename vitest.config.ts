import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Tests run in two environments because the codebase genuinely has two kinds of
 * logic: pure string/data transforms that need no DOM, and browser-dependent
 * code (DOMParser, canvas, Blob) that does. Rather than forcing jsdom on
 * everything, files opt in with a `@vitest-environment` docblock.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    passWithNoTests: false,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
