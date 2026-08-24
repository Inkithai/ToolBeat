export type TextStatistics = {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  /** Whole minutes, rounded up; 0 only for empty input. */
  readingMinutes: number;
};

/** Average adult silent reading speed for prose, in words per minute. */
const WORDS_PER_MINUTE = 225;

/**
 * Pure text statistics, kept out of the component so the counting rules can be
 * tested directly — the edge cases (hyphenation, abbreviations, trailing
 * punctuation) are where a word counter is actually judged.
 */
export function analyzeText(text: string): TextStatistics {
  const trimmed = text.trim();

  if (!trimmed) {
    return {
      words: 0,
      characters: text.length,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingMinutes: 0,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean).length;

  // Consecutive terminators (`?!`, `...`) end one sentence, not several.
  const sentences = (trimmed.match(/[^.!?]+[.!?]*/g) ?? []).filter((part) => part.trim()).length;

  const paragraphs = trimmed.split(/\n\s*\n/).filter((part) => part.trim()).length;

  return {
    words,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    sentences,
    paragraphs,
    readingMinutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
  };
}
