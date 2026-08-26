/**
 * Lorem Ipsum generation with a seedable PRNG so tests can assert exact
 * output while the UI gets fresh text on every click.
 */

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum", "at",
  "vero", "eos", "accusamus", "iusto", "odio", "totam", "rem", "apere",
  "quia", "voluptas", "assumenda", "repellendus", "quod", "molestiae", "excepturi",
  "obcaecati", "cum", "soluta", "nobis", "eligendi", "optio", "cumque", "nihil",
  "impedit", "quo", "minus", "quod", "maxime", "placeat", "facere", "possimus",
  "omnis", "voluptatem", "accusantium", "doloremque", "laudantium", "totam", "rem",
  "voluptatum", "deleniti", "atque", "corrupti", "quos", "quisquam", "molestias",
  "accusam", "asperiores", "repellat", "perferendis", "eveniet", "vitae", "dicta",
  "reiciendis", "modi", "tempora", "incidunt", "distinctio", "omnium", "dolorum",
  "fuga", "harum", "quibusdam", "excepturi", "officiis", "nemo", "numquam",
  "voluptatem", "eaque", "alias", "consequatur", "magni", "dolores", "eos",
];

export type LoremKind = "paragraphs" | "sentences" | "words";

/** Mulberry32: tiny deterministic PRNG, good enough for filler text. */
export function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function loremText(kind: LoremKind, count: number, seed = Date.now()): string {
  if (!Number.isFinite(count) || count <= 0) throw new Error("Enter a count of at least one.");
  const clamped = Math.min(100, Math.floor(count));
  const rng = makeRng(seed);

  const pick = () => WORDS[Math.floor(rng() * WORDS.length)];
  const sentence = () => {
    const length = 8 + Math.floor(rng() * 10);
    const words = Array.from({ length }, pick);
    words[0] = words[0][0].toUpperCase() + words[0].slice(1);
    return `${words.join(" ")}.`;
  };

  if (kind === "words") {
    const words = Array.from({ length: clamped }, pick);
    return `${words[0][0].toUpperCase()}${words[0].slice(1)} ${words.slice(1).join(" ")}\n`;
  }

  const sentencesPerParagraph = 4;
  const paragraphCount = kind === "sentences" ? Math.max(1, Math.ceil(clamped / sentencesPerParagraph)) : clamped;
  const totalSentences = kind === "sentences" ? clamped : paragraphCount * sentencesPerParagraph;

  const paragraphs: string[] = [""];
  for (let index = 0; index < totalSentences; index += 1) {
    if (kind === "paragraphs" && index > 0 && index % sentencesPerParagraph === 0) paragraphs.push("");
    const last = paragraphs[paragraphs.length - 1];
    paragraphs[paragraphs.length - 1] = (last ? `${last} ` : "") + sentence();
  }
  return `${paragraphs.join("\n\n")}\n`;
}
