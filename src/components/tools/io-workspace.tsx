import type { ReactNode } from "react";

export type WorkspaceStatus = "idle" | "processing" | "complete" | "error";

/**
 * Signature ToolBeat layout: Input → Process → Output.
 *
 * Tools keep their own controls; this only owns the spatial metaphor so a
 * formatter, calculator and converter read as the same product.
 */
export default function IoWorkspace({
  inputLabel = "Input",
  outputLabel = "Output",
  input,
  output,
  process,
  status = "idle",
  outputAction,
  footer,
}: {
  inputLabel?: string;
  outputLabel?: string;
  input: ReactNode;
  output: ReactNode;
  process?: ReactNode;
  status?: WorkspaceStatus;
  outputAction?: ReactNode;
  footer?: ReactNode;
}) {
  const mark =
    status === "processing" ? "…" : status === "complete" ? "✓" : status === "error" ? "!" : "→";

  return (
    <div className="io-workspace">
      <div className="io-grid">
        <section className="min-w-0">
          <p className="meta mb-2 text-ink-500">{inputLabel}</p>
          {input}
        </section>
        <div className="io-arrow" aria-hidden="true">
          <span
            className={`font-mono text-lg ${
              status === "complete"
                ? "text-cyan-400"
                : status === "processing"
                  ? "text-indigo-300"
                  : status === "error"
                    ? "text-rose-300"
                    : "text-ink-600"
            }`}
          >
            {mark}
          </span>
        </div>
        <section className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className={`meta ${status === "complete" ? "text-cyan-400" : "text-ink-500"}`}>{outputLabel}</p>
            {outputAction}
          </div>
          {output}
        </section>
      </div>
      {process ? <div className="mt-4 flex flex-wrap items-center gap-2">{process}</div> : null}
      {footer}
    </div>
  );
}
