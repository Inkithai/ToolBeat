"use client";

import { useEffect } from "react";
import { recordToolVisit } from "@/lib/storage/tool-activity";

/**
 * Records a tool page visit for the "Recently used" row in the directory.
 *
 * Renders nothing. Lives in its own component so page shells stay server
 * components — only this leaf needs the browser. Idempotent by contract, so
 * React Strict Mode's double-invoked effects in development are harmless.
 */
export default function RecordToolVisit({ slug }: { slug: string }) {
  useEffect(() => {
    recordToolVisit(slug);
  }, [slug]);

  return null;
}
