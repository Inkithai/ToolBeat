/**
 * Reading-time estimates. Word counting reuses the same split rule as the word
 * counter so the two tools never disagree about what a "word" is; the WPM
 * rates and the speaking-time estimate are specific to this tool.
 */

export type ReadingPace = "slow" | "average" | "fast";

/** Adult silent reading speeds in words per minute. */
export const READING_PACE_WPM: Record<ReadingPace, number> = {
  slow: 150,
  average: 225,
  fast: 300,
};

/** Average speaking rate for presentations, in words per minute. */
export const SPEAKING_WPM = 150;

export type ReadingTimeResult = {
  words: number;
  characters: number;
  /** Whole minutes of silent reading at the chosen pace, 0 only when empty. */
  readingMinutes: number;
  /** Residual seconds after whole minutes (0–59). */
  readingSeconds: number;
  /** Total silent-reading duration in whole seconds. */
  readingTotalSeconds: number;
  /** Whole minutes of spoken delivery, 0 only when empty. */
  speakingMinutes: number;
  speakingSeconds: number;
  speakingTotalSeconds: number;
};

/** Same word-split rule as `analyzeText` in word-count.ts. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function splitDuration(totalSeconds: number): { minutes: number; seconds: number; totalSeconds: number } {
  const safe = Math.max(0, Math.round(totalSeconds));
  return {
    minutes: Math.floor(safe / 60),
    seconds: safe % 60,
    totalSeconds: safe,
  };
}

/**
 * Estimate silent reading and speaking time for `text` at the given pace.
 * Empty input yields zeros rather than a minimum of one minute — callers that
 * want "at least a minute" can clamp themselves.
 */
export function estimateReadingTime(text: string, pace: ReadingPace = "average"): ReadingTimeResult {
  const words = countWords(text);
  const characters = text.length;

  if (words === 0) {
    return {
      words: 0,
      characters,
      readingMinutes: 0,
      readingSeconds: 0,
      readingTotalSeconds: 0,
      speakingMinutes: 0,
      speakingSeconds: 0,
      speakingTotalSeconds: 0,
    };
  }

  const readingWpm = READING_PACE_WPM[pace];
  const reading = splitDuration((words / readingWpm) * 60);
  const speaking = splitDuration((words / SPEAKING_WPM) * 60);

  return {
    words,
    characters,
    readingMinutes: reading.minutes,
    readingSeconds: reading.seconds,
    readingTotalSeconds: reading.totalSeconds,
    speakingMinutes: speaking.minutes,
    speakingSeconds: speaking.seconds,
    speakingTotalSeconds: speaking.totalSeconds,
  };
}

/** Human label like "3 min 12 sec" or "45 sec" or "less than a second". */
export function formatDuration(minutes: number, seconds: number, totalSeconds: number): string {
  if (totalSeconds <= 0) return "—";
  if (totalSeconds < 1) return "less than a second";
  if (minutes === 0) return `${seconds} sec`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
}
