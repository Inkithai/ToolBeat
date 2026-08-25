/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  RECENT_TOOL_LIMIT,
  readFavoriteSlugs,
  readRecentSlugs,
  recordToolVisit,
  toggleFavorite,
} from "./tool-activity";

describe("tool favorites", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty", () => {
    expect(readFavoriteSlugs()).toEqual([]);
  });

  it("adds, then removes a slug", () => {
    toggleFavorite("pomodoro");
    expect(readFavoriteSlugs()).toEqual(["pomodoro"]);
    toggleFavorite("pomodoro");
    expect(readFavoriteSlugs()).toEqual([]);
  });

  it("stores slugs under the namespaced key, as plain strings", () => {
    toggleFavorite("json-formatter");
    // Preference-shaped record, namespaced like every other stored value.
    expect(window.localStorage.getItem("convertlab:tool-favorites")).toBe(
      '{"slugs":["json-formatter"]}',
    );
  });

  it("degrades to empty when the record is corrupted", () => {
    window.localStorage.setItem("convertlab:tool-favorites", '{"slugs":"nope"}');
    expect(readFavoriteSlugs()).toEqual([]);
  });
});

describe("recent tools", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("records visits most-recent-first and deduplicates", () => {
    recordToolVisit("pomodoro");
    recordToolVisit("word-counter");
    recordToolVisit("pomodoro");
    expect(readRecentSlugs()).toEqual(["pomodoro", "word-counter"]);
  });

  it("is idempotent for a repeated visit, so mount effects are safe", () => {
    recordToolVisit("json-formatter");
    recordToolVisit("json-formatter");
    expect(readRecentSlugs()).toEqual(["json-formatter"]);
  });

  it("caps the list so storage cannot grow without bound", () => {
    for (let index = 0; index < RECENT_TOOL_LIMIT + 5; index += 1) {
      recordToolVisit(`tool-${index}`);
    }
    const slugs = readRecentSlugs();
    expect(slugs).toHaveLength(RECENT_TOOL_LIMIT);
    expect(slugs[0]).toBe(`tool-${RECENT_TOOL_LIMIT + 4}`);
  });
});

describe("activity events", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("notifies listeners on writes so mounted UI can re-read", () => {
    const listener = vi.fn();
    window.addEventListener("convertlab:tool-activity", listener);
    toggleFavorite("pomodoro");
    recordToolVisit("pomodoro");
    expect(listener).toHaveBeenCalledTimes(2);
    window.removeEventListener("convertlab:tool-activity", listener);
  });
});
