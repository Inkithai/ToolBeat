"use client";
import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [origin, setOrigin] = useState("https://myapp.com"); const [allowedOrigin, setAllowedOrigin] = useState("*"); const [methods, setMethods] = useState("GET, POST, PUT, DELETE");
  const [headers, setHeaders] = useState("Content-Type, Authorization"); const [credentials, setCredentials] = useState(false);
  const responseHeaders = [
    { header: "Access-Control-Allow-Origin", value: allowedOrigin, explanation: allowedOrigin === "*" ? "Any origin can access this resource" : `Only ${allowedOrigin} can access this resource` },
    { header: "Access-Control-Allow-Methods", value: methods, explanation: `Allowed HTTP methods: ${methods}` },
    { header: "Access-Control-Allow-Headers", value: headers, explanation: `Client may send these custom headers: ${headers}` },
    ...(credentials ? [{ header: "Access-Control-Allow-Credentials", value: "true", explanation: "Cookies and auth headers are allowed in cross-origin requests" }] : []),
  ];
  const isSecure = credentials && allowedOrigin === "*";
  return (
    <IoWorkspace inputLabel="CORS configuration" outputLabel="Server headers" status="complete"
      input={<div className="space-y-3">
        <label className="space-y-1"><span className="text-xs text-ink-400">Client origin (requesting app)</span><input type="text" value={origin} onChange={e => setOrigin(e.target.value)} className="field w-full font-mono text-xs" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Allowed origin (server response)</span><select value={allowedOrigin} onChange={e => setAllowedOrigin(e.target.value)} className="field w-full"><option value="*">* (any origin)</option><option value={origin}>{origin} (specific)</option></select></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Allowed methods</span><input type="text" value={methods} onChange={e => setMethods(e.target.value)} className="field w-full text-xs" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">Allowed headers</span><input type="text" value={headers} onChange={e => setHeaders(e.target.value)} className="field w-full text-xs" /></label>
        <label className="flex items-center gap-2 text-xs text-ink-300"><input type="checkbox" checked={credentials} onChange={e => setCredentials(e.target.checked)} className="rounded accent-indigo-500" />Allow credentials (cookies, auth)</label>
      </div>}
      output={<div className="space-y-3">
        {isSecure && <div className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-xs text-rose-200">⚠️ <strong>Invalid:</strong> Access-Control-Allow-Credentials: true cannot be combined with Allow-Origin: *. Specify the exact origin instead.</div>}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-2">Preflight request</p>
          <pre className="font-mono text-[10px] text-ink-300">{`OPTIONS /api/data HTTP/1.1
Host: api.example.com
Origin: ${origin}
Access-Control-Request-Method: POST
Access-Control-Request-Headers: ${headers}`}</pre>
        </div>
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-2">Server response</p>
          {responseHeaders.map(r => <div key={r.header} className="mb-2"><code className="font-mono text-[10px] text-emerald-300">{r.header}: {r.value}</code><p className="text-[10px] text-ink-500 ml-2">{r.explanation}</p></div>)}
        </div>
      </div>}
    />
  );
}
