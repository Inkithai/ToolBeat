"use client";

import { useMemo, useState } from "react";
import { checkPath, parseRobotsTxt } from "@/lib/tools/robots-txt";

const SAMPLE = `# robots.txt for convertlab.example
User-agent: *
Disallow: /internal/
Crawl-delay: 5
Sitemap: https://convertlab.example/sitemap.xml

User-agent: GptBot
Disallow: /`;

export default function RobotsTxtAnalyzerClient() {
  const [text, setText] = useState(SAMPLE);
  const [agent, setAgent] = useState("Googlebot");
  const [path, setPath] = useState("/internal/secrets.txt");

  const parsed = useMemo(() => parseRobotsTxt(text), [text]);
  const result = useMemo(() => checkPath(parsed, agent.trim() || "*", path), [parsed, agent, path]);

  const field = "w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/50";
  const label = "mb-1.5 block text-xs font-medium text-ink-400";

  return (
    <div className="space-y-4">
      <label className="block">
        <span className={label}>robots.txt</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={8}
          spellCheck={false}
          className={`${field} resize-y font-mono text-xs`}
          placeholder={"user-agent: *\ndisallow: /private/"}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={label}>User agent</span>
          <input
            type="text"
            value={agent}
            onChange={(event) => setAgent(event.target.value)}
            className={`${field} font-mono`}
            placeholder="Googlebot"
          />
        </label>
        <label className="block">
          <span className={label}>Path to test</span>
          <input
            type="text"
            value={path}
            onChange={(event) => setPath(event.target.value)}
            className={`${field} font-mono`}
            placeholder="/some/page.html"
          />
        </label>
      </div>

      <div
        className={`flex items-center gap-3 rounded-xl border p-4 ${
          result.allowed
            ? "border-emerald-400/20 bg-emerald-500/10"
            : "border-rose-400/20 bg-rose-500/10"
        }`}
        role="status"
      >
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
            result.allowed ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
          }`}
        >
          {result.allowed ? "Allowed" : "Blocked"}
        </span>
        <p className="text-sm text-ink-200">{result.reason}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="meta mb-2 text-ink-500">
            Rules in the matched group {result.matchedAgents.length > 0 && `(${result.matchedAgents.join(", ")})`}
          </p>
          {result.rules.length === 0 ? (
            <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-ink-500">
              The matched group has no Allow/Disallow rules — everything is allowed.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-white/[0.06]">
              {result.rules.map((rule, index) => (
                <div
                  key={`${rule.rule.type}-${rule.rule.path}`}
                  className={`flex items-center gap-3 px-3 py-2 ${index % 2 === 1 ? "bg-white/[0.02]" : ""}`}
                >
                  <span
                    className={`w-16 shrink-0 rounded px-1.5 py-0.5 text-center text-[10px] font-bold uppercase ${
                      rule.rule.type === "Allow" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                    }`}
                  >
                    {rule.rule.type}
                  </span>
                  <span className="break-all font-mono text-xs text-white">{rule.rule.path}</span>
                  {rule.matched && (
                    <span className="ml-auto shrink-0 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                      matches
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {result.crawlDelay !== null && (
            <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-ink-200">
              Crawl-delay for this agent: <span className="font-semibold text-white">{result.crawlDelay}s</span>
            </p>
          )}
          <div>
            <p className="meta mb-1.5 text-ink-500">Sitemaps declared</p>
            {parsed.sitemaps.length === 0 ? (
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-ink-500">
                None.
              </p>
            ) : (
              <ul className="space-y-1">
                {parsed.sitemaps.map((sitemap) => (
                  <li key={sitemap} className="break-all font-mono text-xs text-indigo-300">
                    {sitemap}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
