"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
const HEADERS: Record<string, { type: "request"|"response"|"both"; description: string; example: string }> = {
  "Content-Type": { type: "both", description: "The media type of the resource. Tells the recipient how to interpret the content.", example: "application/json; charset=utf-8" },
  "Accept": { type: "request", description: "Media types the client can understand, used for content negotiation.", example: "text/html, application/json" },
  "Authorization": { type: "request", description: "Credentials for authenticating the client with the server.", example: "Bearer eyJhbGciOi..." },
  "Cache-Control": { type: "both", description: "Directives for caching mechanisms in both requests and responses.", example: "no-cache, no-store, must-revalidate" },
  "Content-Length": { type: "both", description: "The size of the request/response body in bytes.", example: "348" },
  "Content-Encoding": { type: "both", description: "Any encodings applied to the content (compression).", example: "gzip" },
  "Cookie": { type: "request", description: "Stored cookies previously sent by the server via Set-Cookie.", example: "session=abc123; theme=dark" },
  "Set-Cookie": { type: "response", description: "Send cookies from the server to be stored by the client.", example: "session=abc123; HttpOnly; Secure; SameSite=Lax" },
  "CORS Headers": { type: "response", description: "Access-Control-Allow-Origin, Methods, Headers — control cross-origin access.", example: "Access-Control-Allow-Origin: *" },
  "ETag": { type: "response", description: "An identifier for a specific version of a resource, used for caching.", example: '"33a64df551425fcc55e"' },
  "Host": { type: "request", description: "The domain name of the server (required in HTTP/1.1).", example: "example.com" },
  "If-None-Match": { type: "request", description: "Makes the request conditional — returns 304 if the ETag still matches.", example: '"33a64df551425fcc55e"' },
  "Location": { type: "response", description: "The URL to redirect to (used with 3xx status codes).", example: "https://example.com/new-page" },
  "Origin": { type: "request", description: "The origin (scheme, host, port) that triggered the request.", example: "https://example.com" },
  "Referer": { type: "request", description: "The address of the previous page from which this request was made.", example: "https://example.com/previous-page" },
  "Server": { type: "response", description: "Information about the server software.", example: "nginx/1.21.0" },
  "User-Agent": { type: "request", description: "Information about the client (browser, OS, version).", example: "Mozilla/5.0 (Windows NT 10.0...)" },
  "X-Forwarded-For": { type: "request", description: "The originating client IP when behind a proxy or load balancer.", example: "203.0.113.50, 70.41.3.18" },
  "X-Frame-Options": { type: "response", description: "Whether the page can be displayed in an iframe (clickjacking protection).", example: "DENY" },
  "X-Content-Type-Options": { type: "response", description: "Prevents MIME-sniffing — forces the declared Content-Type.", example: "nosniff" },
  "Strict-Transport-Security": { type: "response", description: "Tells the browser to always use HTTPS for this domain.", example: "max-age=31536000; includeSubDomains" },
  "X-XSS-Protection": { type: "response", description: "Enables the browser's built-in XSS filtering (deprecated in modern browsers).", example: "1; mode=block" },
  "Referrer-Policy": { type: "response", description: "Controls how much referrer information is sent with requests.", example: "strict-origin-when-cross-origin" },
  "Content-Security-Policy": { type: "response", description: "Defines allowed sources for scripts, styles, images and other resources.", example: "default-src 'self'; script-src 'self' cdn.example.com" },
};
export default function Client() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => { const q = query.toLowerCase(); return Object.entries(HEADERS).filter(([k, v]) => k.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)); }, [query]);
  return (
    <IoWorkspace inputLabel="Search headers" outputLabel="Header details" status={filtered.length > 0 ? "complete" : "idle"}
      input={<input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search HTTP headers..." className="field w-full" autoFocus />}
      output={<div className="max-h-[24rem] space-y-2 overflow-auto">
        {filtered.map(([name, info]) => (
          <div key={name} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2"><code className="font-mono text-sm font-bold text-indigo-300">{name}</code><span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${info.type === "request" ? "bg-blue-500/20 text-blue-300" : info.type === "response" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>{info.type}</span></div>
            <p className="mt-1 text-xs text-ink-300">{info.description}</p>
            <code className="mt-1 block font-mono text-[10px] text-cyan-300">{info.example}</code>
          </div>
        ))}
      </div>}
    />
  );
}
