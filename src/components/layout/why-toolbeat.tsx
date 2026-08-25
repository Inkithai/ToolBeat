const ROWS = [
  { other: "Sign up first", ours: "Start immediately" },
  { other: "Upload files", ours: "Process locally" },
  { other: "Ads and distractions", ours: "Focus on the task" },
  { other: "Different tools everywhere", ours: "One toolbox" },
];

export default function WhyToolBeat() {
  return (
    <section id="why-toolbeat" className="scroll-mt-20 border-b border-white/[0.06] px-4 py-16 sm:px-6 sm:py-20" aria-label="Why people switch">
      <div className="mx-auto max-w-5xl">
        <p className="meta mb-3 text-ink-500">Why people switch</p>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Less searching. More doing.</h2>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="meta w-1/2 py-3 pr-4 font-normal text-ink-500">Other tool sites</th>
                <th className="meta w-1/2 bg-indigo-500/[0.07] px-4 py-3 font-normal text-indigo-200">ToolBeat</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.ours} className="border-b border-white/[0.06]">
                  <td className="py-4 pr-4 text-sm text-ink-400">{row.other}</td>
                  <td className="bg-indigo-500/[0.07] px-4 py-4 text-sm font-semibold text-white">{row.ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
