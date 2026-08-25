import Link from "next/link";

const ROW_ONE = [
  { label: "Format JSON", href: "/tools/json-formatter" },
  { label: "Convert PNG", href: "/conversion/png-to-jpg" },
  { label: "Count words", href: "/tools/word-counter" },
  { label: "Generate passwords", href: "/tools/password-generator" },
  { label: "Decode JWT", href: "/tools/jwt-decoder" },
  { label: "Convert CSV", href: "/conversion/csv-to-json" },
];

const ROW_TWO = [
  { label: "Test regex", href: "/tools/regex-tester" },
  { label: "Calculate interest", href: "/tools/compound-interest" },
  { label: "Compare text", href: "/tools/text-diff" },
  { label: "Generate UUID", href: "/tools/uuid-generator" },
  { label: "Remove duplicates", href: "/tools/duplicate-line-remover" },
  { label: "Encode Base64", href: "/tools/base64-encoder" },
];

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: typeof ROW_ONE;
  reverse?: boolean;
}) {
  const sequence = [...items, ...items];
  return (
    <div className="marquee-mask overflow-hidden">
      <div className={`marquee-track ${reverse ? "marquee-track-reverse" : ""}`}>
        {sequence.map((item, index) => (
          <Link
            key={`${item.href}-${index}`}
            href={item.href}
            className="meta shrink-0 px-4 text-ink-400 transition-colors hover:text-indigo-200"
          >
            {item.label}
            <span className="mx-4 text-ink-700" aria-hidden="true">
              ·
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ActionMarquee() {
  return (
    <section className="border-y border-white/[0.06] py-3" aria-label="Things ToolBeat can do">
      <MarqueeRow items={ROW_ONE} />
      <div className="mt-2">
        <MarqueeRow items={ROW_TWO} reverse />
      </div>
    </section>
  );
}
