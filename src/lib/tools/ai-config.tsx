"use client";

/**
 * Shared BYOK (Bring Your Own Key) infrastructure.
 * Users store their API key in localStorage — it never leaves the device
 * except in the direct browser→provider call.
 */

import { useState, useEffect } from "react";

const STORAGE_KEY = "convertlab:ai:openai_key";

export function useApiKey() {
  const [key, setKeyState] = useState("");

  useEffect(() => {
    try { setKeyState(localStorage.getItem(STORAGE_KEY) || ""); } catch { /* SSR */ }
  }, []);

  const setKey = (newKey: string) => {
    try {
      if (newKey) localStorage.setItem(STORAGE_KEY, newKey);
      else localStorage.removeItem(STORAGE_KEY);
      setKeyState(newKey);
    } catch { /* storage unavailable */ }
  };

  return { key, setKey };
}

export function ApiKeySettings({ apiKey, onKeyChange }: { apiKey: string; onKeyChange: (k: string) => void }) {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-4 rounded-lg border border-amber-400/20 bg-amber-500/5 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-amber-300">🔑 Bring Your Own Key</p>
        <button type="button" onClick={() => setShow(!show)} className="text-xs text-ink-400 hover:text-white">
          {show ? "Hide" : "Configure"}
        </button>
      </div>
      {show && (
        <div className="mt-2 space-y-2">
          <p className="text-[10px] text-ink-400">
            Your key is stored in your browser&apos;s localStorage only. It&apos;s sent directly to OpenAI from your browser — never routed through our servers.
          </p>
          <input
            type={show ? "text" : "password"}
            value={apiKey}
            onChange={e => onKeyChange(e.target.value)}
            placeholder="sk-..."
            className="field w-full font-mono text-xs"
          />
          <p className="text-[10px] text-ink-500">
            Get a key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-indigo-200">platform.openai.com/api-keys</a>
          </p>
        </div>
      )}
      {!apiKey && <p className="mt-1 text-[10px] text-rose-300">No API key configured. Click &quot;Configure&quot; above.</p>}
    </div>
  );
}

export async function callOpenAI(apiKey: string, messages: { role: string; content: string }[], model = "gpt-4o-mini"): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.3 }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
