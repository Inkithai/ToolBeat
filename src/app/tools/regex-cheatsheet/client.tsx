"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

const PATTERNS = [
  { name: "Email", pattern: "[\\w.-]+@[\\w.-]+\\.\\w{2,}", description: "Matches most common email formats" },
  { name: "URL", pattern: "https?:\\/\\/[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+", description: "Matches HTTP and HTTPS URLs" },
  { name: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", description: "Matches IPv4 addresses" },
  { name: "Phone (US)", pattern: "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}", description: "US phone formats" },
  { name: "Date (YYYY-MM-DD)", pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])", description: "ISO date format" },
  { name: "Hex Color", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b", description: "3 or 6 digit hex colors" },
  { name: "Credit Card", pattern: "\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b", description: "16-digit card numbers" },
  { name: "SSN", pattern: "\\b\\d{3}-\\d{2}-\\d{4}\\b", description: "US Social Security Number format" },
  { name: "ZIP Code (US)", pattern: "\\b\\d{5}(?:-\\d{4})?\\b", description: "5-digit or ZIP+4" },
  { name: "Password (strong)", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", description: "8+ chars, upper, lower, digit, special" },
  { name: "HTML Tag", pattern: "<\\/?[\\w]+[^>]*>", description: "Matches opening/closing HTML tags" },
  { name: "Whitespace", pattern: "\\s+", description: "One or more whitespace chars" },
];

const SYNTAX = [
  { token: ".", desc: "Any character (except newline)" },
  { token: "\\d", desc: "Digit (0-9)" },
  { token: "\\w", desc: "Word character (a-z, A-Z, 0-9, _)" },
  { token: "\\s", desc: "Whitespace (space, tab, newline)" },
  { token: "^", desc: "Start of string/line" },
  { token: "$", desc: "End of string/line" },
  { token: "*", desc: "Zero or more" },
  { token: "+", desc: "One or more" },
  { token: "?", desc: "Zero or one (optional)" },
  { token: "{n}", desc: "Exactly n times" },
  { token: "{n,m}", desc: "Between n and m times" },
  { token: "[abc]", desc: "Character class (a or b or c)" },
  { token: "[^abc]", desc: "Negated class (not a, b, or c)" },
  { token: "(abc)", desc: "Capture group" },
  { token: "(?:abc)", desc: "Non-capturing group" },
  { token: "a|b", desc: "Alternation (a or b)" },
  { token: "\\b", desc: "Word boundary" },
  { token: "\\1", desc: "Backreference to group 1" },
];

export default function Client() {
  const [testString, setTestString] = useState("");
  const [selectedPattern, setSelectedPattern] = useState(0);

  const matches = useMemo(() => {
    if (!testString) return [];
    try {
      const regex = new RegExp(PATTERNS[selectedPattern].pattern, "g");
      return Array.from(testString.matchAll(regex));
    } catch {
      return [];
    }
  }, [testString, selectedPattern]);

  return (
    <IoWorkspace
      inputLabel="Test string"
      outputLabel="Reference & matches"
      status={matches.length > 0 ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <textarea
            value={testString}
            onChange={e => setTestString(e.target.value)}
            rows={6}
            placeholder="Paste text to test patterns against..."
            className="field w-full text-sm"
          />
          <div className="flex flex-wrap gap-1.5">
            {PATTERNS.map((p, i) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setSelectedPattern(i)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  selectedPattern === i ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400 hover:text-white"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      }
      output={
        <div className="space-y-3">
          <div className="rounded-lg border border-indigo-400/20 bg-indigo-500/5 p-3">
            <p className="text-xs font-bold text-indigo-300">{PATTERNS[selectedPattern].name}</p>
            <code className="mt-1 block break-all font-mono text-[10px] text-white">/{PATTERNS[selectedPattern].pattern}/g</code>
            <p className="mt-1 text-[10px] text-ink-400">{PATTERNS[selectedPattern].description}</p>
            <p className="mt-1 text-xs font-bold text-white">{matches.length} match{matches.length !== 1 ? "es" : ""}</p>
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">Regex syntax reference</p>
            <div className="grid grid-cols-2 gap-1">
              {SYNTAX.map(s => (
                <div key={s.token} className="flex items-center gap-2 rounded border border-white/[0.04] px-2 py-1">
                  <code className="font-mono text-[10px] font-bold text-cyan-300">{s.token}</code>
                  <span className="truncate text-[10px] text-ink-500">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}
