"use client";

import { useEffect } from "react";

/** Registers the lightweight app-shell cache without affecting normal browsing. */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline support is progressive enhancement; never block a tool on it.
      });
    }
  }, []);
  return null;
}
