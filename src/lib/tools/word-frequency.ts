/**
 * Word frequency ranking with case control and top-N.
 */

export type WordEntry = {
  word: string;
  count: number;
  pct: number;
};

export type WordFrequencyOptions = {
  caseInsensitive?: boolean;
  /** Ignore words shorter than this (default 2, so "a"/"I" drop out). */
  minLength?: number;
  topN?: number;
};

export type WordFrequencyResult = {
  entries: WordEntry[];
  unique: number;
  total: number;
};

export function wordFrequency(text: string, options: WordFrequencyOptions = {}): WordFrequencyResult {
  const { caseInsensitive = true, minLength = 2, topN = 20 } = options;
  const pattern = caseInsensitive ? /[a-z0-9]+(?:'[a-z0-9]+)*/g : /[A-Za-z0-9]+(?:'[A-Za-z0-9]+)*/g;
  const tokens = caseInsensitive ? text.toLowerCase().match(pattern) ?? [] : text.match(pattern) ?? [];
  const min = Math.max(0, minLength);
  const counts = new Map<string, number>();
  for (const token of tokens) {
    if (token.length < min) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
  const entries: WordEntry[] = [...counts.entries()]
    .map(([word, count]) => ({
      word,
      count,
      pct: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((x, y) => y.count - x.count || x.word.localeCompare(y.word));
  return { entries: entries.slice(0, topN), unique: counts.size, total };
}
