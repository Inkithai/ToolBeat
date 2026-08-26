"use client";

import { useState } from "react";
import { analyzeIp, type IpAnalysis } from "@/lib/tools/ip-cidr";

function Stat({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="meta text-ink-500">{label}</p>
      <p className={`mt-1 break-all text-sm font-semibold text-white sm:text-base ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export default function IpCidrCalculatorClient() {
  const [input, setInput] = useState("192.168.1.0/24");
  const [analysis, setAnalysis] = useState<IpAnalysis | null>(null);
  const [error, setError] = useState("");

  const analyze = () => {
    try {
      setAnalysis(analyzeIp(input));
      setError("");
    } catch (caught) {
      setAnalysis(null);
      setError(caught instanceof Error ? caught.message : "Could not analyze that address.");
    }
  };

  const field = "w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/50";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && analyze()}
          placeholder="192.168.1.0/24 or 2001:db8::/48"
          className={`${field} font-mono sm:flex-1`}
        />
        <button type="button" onClick={analyze} className="btn-primary">
          Analyze
        </button>
      </div>
      <p className="text-xs text-ink-600">
        IPv4: <code className="font-mono">10.0.0.5</code>, <code className="font-mono">172.16.0.0/16</code> · IPv6:{" "}
        <code className="font-mono">2001:db8::/48</code>, <code className="font-mono">fe80::1</code> (bare IPv6 is
        treated as /64)
      </p>

      {error && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
          {error}
        </p>
      )}

      {analysis && (
        <div className="space-y-4">
          {analysis.version === 4 ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Network" value={analysis.network} />
                <Stat label="Broadcast" value={analysis.broadcast} />
                <Stat label="Addresses" value={analysis.size.toLocaleString()} />
                <Stat label="Usable hosts" value={analysis.usable.toLocaleString()} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="First usable" value={analysis.firstUsable} />
                <Stat label="Last usable" value={analysis.lastUsable} />
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="Network" value={analysis.network} />
                <Stat label="Block size" value={`${analysis.size} addresses`} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="First address" value={analysis.firstAddress} />
                <Stat label="Last address" value={analysis.lastAddress} />
              </div>
              {analysis.prefixWasDefaulted && (
                <p className="text-xs text-ink-600">
                  No prefix was given, so /{analysis.prefix} (the usual subnet size) was assumed.
                </p>
              )}
            </>
          )}
          <p className="text-xs text-ink-600">
            Input {analysis.address} → /{analysis.prefix} {analysis.version === 4 ? "IPv4" : "IPv6"} block.
          </p>
        </div>
      )}
    </div>
  );
}
