import { describe, expect, it } from "vitest";
import {
  countWords,
  estimateReadingTime,
  formatDuration,
  READING_PACE_WPM,
} from "./reading-time";

describe("countWords", () => {
  it("matches whitespace-split word counting", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords("one two three")).toBe(3);
    expect(countWords("  spaced   out  ")).toBe(2);
  });
});

describe("estimateReadingTime", () => {
  it("returns zeros for empty input", () => {
    expect(estimateReadingTime("")).toEqual({
      words: 0,
      characters: 0,
      readingMinutes: 0,
      readingSeconds: 0,
      readingTotalSeconds: 0,
      speakingMinutes: 0,
      speakingSeconds: 0,
      speakingTotalSeconds: 0,
    });
  });

  it("estimates average pace for a known word count", () => {
    // 225 words at 225 wpm → exactly 1 minute of reading, 1.5 min speaking.
    const text = Array.from({ length: 225 }, (_, i) => `w${i}`).join(" ");
    const result = estimateReadingTime(text, "average");
    expect(result.words).toBe(225);
    expect(result.readingTotalSeconds).toBe(60);
    expect(result.readingMinutes).toBe(1);
    expect(result.readingSeconds).toBe(0);
    expect(result.speakingTotalSeconds).toBe(90);
    expect(result.speakingMinutes).toBe(1);
    expect(result.speakingSeconds).toBe(30);
  });

  it("scales with pace", () => {
    const text = Array.from({ length: READING_PACE_WPM.slow }, (_, i) => `w${i}`).join(" ");
    const slow = estimateReadingTime(text, "slow");
    const fast = estimateReadingTime(text, "fast");
    expect(slow.readingTotalSeconds).toBe(60);
    // Same words at double the WPM → half the time.
    expect(fast.readingTotalSeconds).toBe(30);
  });

  it("counts characters including spaces", () => {
    expect(estimateReadingTime("ab cd").characters).toBe(5);
  });
});

describe("formatDuration", () => {
  it("renders compact human labels", () => {
    expect(formatDuration(0, 0, 0)).toBe("—");
    expect(formatDuration(0, 45, 45)).toBe("45 sec");
    expect(formatDuration(3, 0, 180)).toBe("3 min");
    expect(formatDuration(3, 12, 192)).toBe("3 min 12 sec");
  });
});
