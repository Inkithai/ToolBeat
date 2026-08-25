"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, KeyRound, ShieldQuestion } from "lucide-react";
import { claimToDate, decodeJwt } from "@/lib/tools/jwt";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Live decode; a half-pasted token is a normal intermediate state. */
export default function JwtDecoderClient() {
  const [token, setToken] = useState("");

  const result = useMemo(() => {
    if (!token.trim()) return { status: "empty" as const };
    try {
      return { status: "ok" as const, decoded: decodeJwt(token) };
    } catch (caught: unknown) {
      return { status: "error" as const, message: caught instanceof Error ? caught.message : "Could not decode this token." };
    }
  }, [token]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        <p className="flex items-center gap-2 font-semibold">
          <ShieldQuestion className="h-4 w-4 shrink-0" aria-hidden="true" />
          This tool decodes and displays tokens. It does <strong>not</strong> verify signatures — never treat its
          output as proof a token is trustworthy.
        </p>
      </section>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ink-200">Token</span>
        <textarea
          value={token}
          onChange={(event) => setToken(event.target.value)}
          spellCheck={false}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSJ9.signature"
          className="h-32 w-full resize-y rounded-xl border border-white/10 bg-navy-900 p-4 font-mono text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/15"
        />
      </label>

      {result.status === "error" && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {result.message}
        </p>
      )}

      {result.status === "ok" && (
        <>
          <section className="grid gap-3 sm:grid-cols-3" aria-label="Claim dates">
            <ClaimDate label="Issued at (iat)" date={claimToDate(result.decoded.issuedAt)} />
            <ClaimDate label="Not before (nbf)" date={claimToDate(result.decoded.notBefore)} />
            <ClaimDate label="Expires (exp)" date={claimToDate(result.decoded.expiresAt)} />
          </section>

          {result.decoded.isExpired !== null && (
            <p
              role="status"
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
                result.decoded.isExpired
                  ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
                  : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {result.decoded.isExpired ? (
                <>
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" /> This token is expired (by its own exp claim).
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Not expired according to its exp claim.
                </>
              )}
            </p>
          )}

          <section className="flex flex-wrap items-center gap-2 text-xs text-ink-200" aria-label="Token structure">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-semibold">
              <KeyRound className="h-3 w-3 text-indigo-400" aria-hidden="true" />
              {result.decoded.hasSignature ? "Has a signature segment (not verified here)" : "Unsigned (alg: none-style) token"}
            </span>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-ink-200">Header</span>
              <textarea
                value={JSON.stringify(result.decoded.header, null, 2)}
                readOnly
                spellCheck={false}
                className="h-64 w-full resize-y rounded-xl border border-white/10 bg-navy-950 p-4 font-mono text-xs text-ink-50 outline-none"
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-ink-200">Payload</span>
              <textarea
                value={JSON.stringify(result.decoded.payload, null, 2)}
                readOnly
                spellCheck={false}
                className="h-64 w-full resize-y rounded-xl border border-white/10 bg-navy-950 p-4 font-mono text-xs text-ink-50 outline-none"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ClaimDate({ label, date }: { label: string; date: Date | null }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm text-white">
        {date && !Number.isNaN(date.getTime()) ? dateFormatter.format(date) : "—"}
      </p>
    </div>
  );
}
