"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
function analyzePassword(pw: string) {
  if (!pw) return { score: 0, entropy: 0, label: "", checks: [] };
  let charsetSize = 0;
  const checks = [
    { label: "Lowercase letters (a-z)", pass: /[a-z]/.test(pw) },
    { label: "Uppercase letters (A-Z)", pass: /[A-Z]/.test(pw) },
    { label: "Digits (0-9)", pass: /\d/.test(pw) },
    { label: "Special characters", pass: /[^a-zA-Z0-9]/.test(pw) },
    { label: "At least 8 characters", pass: pw.length >= 8 },
    { label: "At least 12 characters", pass: pw.length >= 12 },
    { label: "No common patterns", pass: !/(123|abc|password|qwerty|111|aaa)/i.test(pw) },
    { label: "No repeated chars (3+)", pass: !/(.)\1{2,}/.test(pw) },
  ];
  if (/[a-z]/.test(pw)) charsetSize += 26;
  if (/[A-Z]/.test(pw)) charsetSize += 26;
  if (/\d/.test(pw)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) charsetSize += 32;
  const entropy = charsetSize > 0 ? Math.round(pw.length * Math.log2(charsetSize)) : 0;
  const passed = checks.filter(c => c.pass).length;
  const score = Math.min(100, Math.round((passed / checks.length) * 100));
  const label = score < 30 ? "Very weak" : score < 50 ? "Weak" : score < 70 ? "Fair" : score < 90 ? "Strong" : "Very strong";
  return { score, entropy, label, checks };
}
export default function Client() {
  const [pw, setPw] = useState("P@ssw0rd!");
  const result = useMemo(() => analyzePassword(pw), [pw]);
  const color = result.score < 30 ? "rose" : result.score < 50 ? "orange" : result.score < 70 ? "amber" : result.score < 90 ? "emerald" : "green";
  return (
    <IoWorkspace inputLabel="Password" outputLabel="Strength analysis" status={pw ? "complete" : "idle"}
      input={<div className="space-y-3"><input type="text" value={pw} onChange={e => setPw(e.target.value)} className="field w-full font-mono" placeholder="Enter a password to test" /><p className="text-[10px] text-ink-600">⚠ All analysis is done locally. Nothing leaves your device.</p></div>}
      output={pw ? <div className="space-y-3">
        <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center"><p className="text-xs text-ink-500">Strength</p><p className="text-3xl font-bold text-white">{result.label}</p><p className="text-xs text-ink-400">Score: {result.score}/100</p></div>
        <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]"><div className={`h-full rounded-full bg-${color}-500 transition-all`} style={{ width: `${result.score}%` }} /></div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center"><p className="text-[10px] text-ink-500">Entropy</p><p className="text-2xl font-bold text-white">{result.entropy} bits</p></div>
        <div className="space-y-1">{result.checks.map((c, i) => <div key={i} className="flex items-center gap-2 text-xs"><span className={`h-3 w-3 rounded-full ${c.pass ? "bg-emerald-500" : "bg-rose-500"}`} /><span className={c.pass ? "text-ink-300" : "text-ink-500"}>{c.label}</span></div>)}</div>
      </div> : <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">Enter a password</div>}
    />
  );
}
