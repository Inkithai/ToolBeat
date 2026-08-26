"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

const HTTP_STATUS_CODES: Record<number, { phrase: string; description: string; category: string }> = {
  100: { phrase: "Continue", description: "The initial part of the request has been received. The client should continue with the request.", category: "1xx Informational" },
  101: { phrase: "Switching Protocols", description: "The server is switching to the protocol requested by the client via Upgrade header.", category: "1xx Informational" },
  102: { phrase: "Processing", description: "The server has received the request and is processing it, but no response is available yet.", category: "1xx Informational" },
  103: { phrase: "Early Hints", description: "Allows the client to start preloading resources while the server prepares a response.", category: "1xx Informational" },

  200: { phrase: "OK", description: "The request succeeded. The meaning depends on the method: GET returns the resource, POST describes the result.", category: "2xx Success" },
  201: { phrase: "Created", description: "The request succeeded and a new resource was created. Typically sent after POST or PUT.", category: "2xx Success" },
  202: { phrase: "Accepted", description: "The request was accepted for processing, but it has not been completed yet.", category: "2xx Success" },
  203: { phrase: "Non-Authoritative Information", description: "The returned metadata is from a cached or third-party copy, not the origin server.", category: "2xx Success" },
  204: { phrase: "No Content", description: "The request succeeded but there is no content to return. Common after DELETE.", category: "2xx Success" },
  205: { phrase: "Reset Content", description: "The request succeeded; the client should reset the document view.", category: "2xx Success" },
  206: { phrase: "Partial Content", description: "The server is delivering only part of the resource, as requested via Range header.", category: "2xx Success" },

  300: { phrase: "Multiple Choices", description: "Multiple options for the resource that the client may follow.", category: "3xx Redirection" },
  301: { phrase: "Moved Permanently", description: "The resource has been permanently moved to a new URL. Update bookmarks and links.", category: "3xx Redirection" },
  302: { phrase: "Found", description: "The resource temporarily lives at a different URL. The method may change to GET.", category: "3xx Redirection" },
  303: { phrase: "See Other", description: "The response can be found at a different URI using a GET request.", category: "3xx Redirection" },
  304: { phrase: "Not Modified", description: "The resource has not changed since the last request. Use the cached version.", category: "3xx Redirection" },
  305: { phrase: "Use Proxy", description: "The resource must be accessed through the proxy indicated in the Location header. (Deprecated)", category: "3xx Redirection" },
  307: { phrase: "Temporary Redirect", description: "The resource temporarily lives at a different URL. Unlike 302, the method is preserved.", category: "3xx Redirection" },
  308: { phrase: "Permanent Redirect", description: "The resource has permanently moved. Unlike 301, the method is preserved.", category: "3xx Redirection" },

  400: { phrase: "Bad Request", description: "The server cannot process the request due to malformed syntax or invalid parameters.", category: "4xx Client Error" },
  401: { phrase: "Unauthorized", description: "Authentication is required. The request lacks valid credentials.", category: "4xx Client Error" },
  402: { phrase: "Payment Required", description: "Reserved for future use. Sometimes used for payment-gated APIs.", category: "4xx Client Error" },
  403: { phrase: "Forbidden", description: "The server understood the request but refuses to authorize it. Authentication won't help.", category: "4xx Client Error" },
  404: { phrase: "Not Found", description: "The requested resource does not exist on the server.", category: "4xx Client Error" },
  405: { phrase: "Method Not Allowed", description: "The HTTP method is not allowed for this resource. Check the Allow header.", category: "4xx Client Error" },
  406: { phrase: "Not Acceptable", description: "The server cannot produce a response matching the Accept headers.", category: "4xx Client Error" },
  407: { phrase: "Proxy Authentication Required", description: "You must authenticate with a proxy before making this request.", category: "4xx Client Error" },
  408: { phrase: "Request Timeout", description: "The server timed out waiting for the request from the client.", category: "4xx Client Error" },
  409: { phrase: "Conflict", description: "The request conflicts with the current state of the resource (e.g. edit conflict).", category: "4xx Client Error" },
  410: { phrase: "Gone", description: "The resource has been permanently deleted and will not return.", category: "4xx Client Error" },
  411: { phrase: "Length Required", description: "The request must include a Content-Length header.", category: "4xx Client Error" },
  412: { phrase: "Precondition Failed", description: "A condition in the request headers (e.g. If-Match) evaluated to false.", category: "4xx Client Error" },
  413: { phrase: "Payload Too Large", description: "The request body exceeds the server's maximum acceptable size.", category: "4xx Client Error" },
  414: { phrase: "URI Too Long", description: "The request URI is longer than the server is willing to process.", category: "4xx Client Error" },
  415: { phrase: "Unsupported Media Type", description: "The media format of the request is not supported by the server.", category: "4xx Client Error" },
  416: { phrase: "Range Not Satisfiable", description: "The requested range is not available for the resource.", category: "4xx Client Error" },
  417: { phrase: "Expectation Failed", description: "The server cannot meet the requirements of the Expect header.", category: "4xx Client Error" },
  418: { phrase: "I'm a Teapot", description: "The server refuses to brew coffee because it is, permanently, a teapot. (RFC 2324)", category: "4xx Client Error" },
  421: { phrase: "Misdirected Request", description: "The request was sent to a server that cannot produce a response for this resource.", category: "4xx Client Error" },
  422: { phrase: "Unprocessable Entity", description: "The request was well-formed but contains semantic errors. Common in form validation.", category: "4xx Client Error" },
  423: { phrase: "Locked", description: "The resource is currently locked.", category: "4xx Client Error" },
  424: { phrase: "Failed Dependency", description: "The request failed because it depended on another request that failed.", category: "4xx Client Error" },
  425: { phrase: "Too Early", description: "The server is unwilling to risk processing a request that might be replayed.", category: "4xx Client Error" },
  426: { phrase: "Upgrade Required", description: "The client should switch to a different protocol (indicated in Upgrade header).", category: "4xx Client Error" },
  428: { phrase: "Precondition Required", description: "The server requires the request to be conditional to prevent conflicts.", category: "4xx Client Error" },
  429: { phrase: "Too Many Requests", description: "Rate limit exceeded. Check the Retry-After header for when to retry.", category: "4xx Client Error" },
  431: { phrase: "Request Header Fields Too Large", description: "The request headers are too large for the server to process.", category: "4xx Client Error" },
  451: { phrase: "Unavailable For Legal Reasons", description: "The resource is unavailable due to legal reasons (censorship, DMCA, etc.).", category: "4xx Client Error" },

  500: { phrase: "Internal Server Error", description: "The server encountered an unexpected condition that prevented it from fulfilling the request.", category: "5xx Server Error" },
  501: { phrase: "Not Implemented", description: "The server does not support the functionality required for this request.", category: "5xx Server Error" },
  502: { phrase: "Bad Gateway", description: "The server received an invalid response from an upstream server.", category: "5xx Server Error" },
  503: { phrase: "Service Unavailable", description: "The server is temporarily unavailable (overloaded or down for maintenance).", category: "5xx Server Error" },
  504: { phrase: "Gateway Timeout", description: "The upstream server did not respond in time.", category: "5xx Server Error" },
  505: { phrase: "HTTP Version Not Supported", description: "The HTTP version in the request is not supported by the server.", category: "5xx Server Error" },
  506: { phrase: "Variant Also Negotiates", description: "The server has an internal configuration error: circular content negotiation.", category: "5xx Server Error" },
  507: { phrase: "Insufficient Storage", description: "The server cannot store the representation needed to complete the request.", category: "5xx Server Error" },
  508: { phrase: "Loop Detected", description: "The server detected an infinite loop while processing the request.", category: "5xx Server Error" },
  510: { phrase: "Not Extended", description: "Further extensions to the request are required.", category: "5xx Server Error" },
  511: { phrase: "Network Authentication Required", description: "The client needs to authenticate to gain network access (captive portals).", category: "5xx Server Error" },
};

export default function Client() {
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return Object.entries(HTTP_STATUS_CODES).sort(([a], [b]) => Number(a) - Number(b));
    return Object.entries(HTTP_STATUS_CODES)
      .filter(([code, entry]) =>
        code.includes(q) ||
        entry.phrase.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q)
      )
      .sort(([a], [b]) => Number(a) - Number(b));
  }, [query]);

  const categories = useMemo(() => {
    const cats = new Set(filtered.map(([, e]) => e.category));
    return Array.from(cats);
  }, [filtered]);

  return (
    <IoWorkspace
      inputLabel="Search"
      outputLabel="Status code details"
      status={selectedCode ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by code or name... (e.g. 404, not found)"
            className="field w-full"
            autoFocus
          />
          <div className="max-h-[18rem] overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.02]">
            {categories.map(cat => (
              <div key={cat}>
                <p className="sticky top-0 z-10 border-b border-white/[0.06] bg-navy-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
                  {cat}
                </p>
                {filtered.filter(([, e]) => e.category === cat).map(([code, entry]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedCode(Number(code))}
                    className={`flex w-full items-center gap-3 px-3 py-1.5 text-left transition-colors ${
                      selectedCode === Number(code) ? "bg-indigo-500/10" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="w-8 font-mono text-sm font-bold text-indigo-300">{code}</span>
                    <span className="text-xs text-ink-300">{entry.phrase}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      }
      output={
        selectedCode && HTTP_STATUS_CODES[selectedCode] ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center">
              <p className="font-mono text-4xl font-extrabold text-white">{selectedCode}</p>
              <p className="mt-1 text-lg font-semibold text-indigo-200">{HTTP_STATUS_CODES[selectedCode].phrase}</p>
              <p className="mt-1 text-xs text-ink-500">{HTTP_STATUS_CODES[selectedCode].category}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-sm leading-relaxed text-ink-300">{HTTP_STATUS_CODES[selectedCode].description}</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            Search or select a status code
          </div>
        )
      }
    />
  );
}
