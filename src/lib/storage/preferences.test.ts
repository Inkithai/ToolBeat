/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearPreference, readPreference, writePreference } from "./preferences";

describe("preference storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("round-trips a value under a namespaced key", () => {
    writePreference("demo", { indent: 4 });
    // The namespace prevents collisions with anything else on the origin.
    expect(window.localStorage.getItem("toolbeat:demo")).toBe('{"indent":4}');
    expect(readPreference("demo", { indent: 2 })).toEqual({ indent: 4 });
  });

  it("returns the fallback when nothing is stored", () => {
    expect(readPreference("missing", { indent: 2 })).toEqual({ indent: 2 });
  });

  it("merges stored values over the fallback, so new fields get defaults", () => {
    // Simulates a stored record written before a new preference was added.
    window.localStorage.setItem("toolbeat:demo", '{"indent":8}');
    expect(readPreference("demo", { indent: 2, sortKeys: true })).toEqual({
      indent: 8,
      sortKeys: true,
    });
  });

  it("falls back rather than throwing on corrupt JSON", () => {
    window.localStorage.setItem("toolbeat:demo", "{not json");
    expect(readPreference("demo", { indent: 2 })).toEqual({ indent: 2 });
  });

  it("rejects stored values of the wrong shape", () => {
    window.localStorage.setItem("toolbeat:demo", "[1,2,3]");
    expect(readPreference("demo", { indent: 2 })).toEqual({ indent: 2 });
  });

  it("survives storage being unavailable, as in private browsing", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(readPreference("demo", { indent: 2 })).toEqual({ indent: 2 });
    expect(() => writePreference("demo", { indent: 4 })).not.toThrow();
  });

  it("clears a stored value", () => {
    writePreference("demo", { indent: 4 });
    clearPreference("demo");
    expect(readPreference("demo", { indent: 2 })).toEqual({ indent: 2 });
  });
});
