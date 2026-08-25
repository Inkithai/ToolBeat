const ITEMS = [
  {
    kicker: "Local processing",
    title: "Your files stay with you",
    semantic: true,
  },
  {
    kicker: "No account",
    title: "Start instantly",
    semantic: false,
  },
  {
    kicker: "Free to use",
    title: "No hidden workflow",
    semantic: false,
  },
];

export default function TrustStrip() {
  return (
    <section className="border-b border-white/[0.06] px-4 py-10 sm:px-6" aria-label="Why ToolBeat">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3 sm:gap-6">
        {ITEMS.map((item) => (
          <div key={item.kicker} className="sm:border-l sm:border-white/[0.06] sm:pl-6 first:sm:border-l-0 first:sm:pl-0">
            <p className={`meta ${item.semantic ? "text-cyan-400" : "text-ink-500"}`}>
              {item.semantic ? "● " : ""}
              {item.kicker}
            </p>
            <p className="mt-2 text-base font-semibold tracking-tight text-white sm:text-lg">{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
