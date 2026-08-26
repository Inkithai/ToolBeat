"use client";
import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import IoWorkspace from "@/components/tools/io-workspace";
export default function Client() {
  const [name, setName] = useState("Ada Lovelace"); const [job, setJob] = useState("Senior Software Engineer"); const [company, setCompany] = useState("ConvertLab");
  const [phone, setPhone] = useState("+1 (555) 123-4567"); const [email, setEmail] = useState("ada@example.com"); const [website, setWebsite] = useState("example.com");
  const [photoUrl, setPhotoUrl] = useState(""); const [accentColor, setAccentColor] = useState("#6366f1"); const [copied, setCopied] = useState(false);
  const html = useMemo(() => `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333;max-width:420px">
  <tr>
    ${photoUrl ? `<td style="padding-right:16px;vertical-align:top"><img src="${photoUrl}" width="80" height="80" style="border-radius:8px;object-fit:cover" /></td>` : ""}
    <td style="vertical-align:top;border-left:3px solid ${accentColor};padding-left:16px">
      <div style="font-size:18px;font-weight:bold;color:#111">${name}</div>
      <div style="color:${accentColor};font-size:13px">${job}</div>
      <div style="color:#666;font-size:13px;margin-top:2px">${company}</div>
      <div style="margin-top:8px;font-size:12px;color:#555;line-height:1.8">
        ${phone ? `<div>📞 ${phone}</div>` : ""}
        ${email ? `<div>✉️ <a href="mailto:${email}" style="color:${accentColor};text-decoration:none">${email}</a></div>` : ""}
        ${website ? `<div>🌐 <a href="https://${website}" style="color:${accentColor};text-decoration:none">${website}</a></div>` : ""}
      </div>
    </td>
  </tr>
</table>`, [name, job, company, phone, email, website, photoUrl, accentColor]);
  const copy = async () => { await navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <IoWorkspace inputLabel="Contact details" outputLabel="HTML signature" status="complete"
      outputAction={<button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-ink-200">{copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button>}
      input={<div className="space-y-2">
        <label className="space-y-1"><span className="text-xs text-ink-400">Full name</span><input type="text" value={name} onChange={e => setName(e.target.value)} className="field w-full" /></label>
        <div className="grid grid-cols-2 gap-2"><label className="space-y-1"><span className="text-xs text-ink-400">Job title</span><input type="text" value={job} onChange={e => setJob(e.target.value)} className="field w-full" /></label><label className="space-y-1"><span className="text-xs text-ink-400">Company</span><input type="text" value={company} onChange={e => setCompany(e.target.value)} className="field w-full" /></label></div>
        <div className="grid grid-cols-2 gap-2"><label className="space-y-1"><span className="text-xs text-ink-400">Phone</span><input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="field w-full" /></label><label className="space-y-1"><span className="text-xs text-ink-400">Email</span><input type="text" value={email} onChange={e => setEmail(e.target.value)} className="field w-full" /></label></div>
        <div className="grid grid-cols-2 gap-2"><label className="space-y-1"><span className="text-xs text-ink-400">Website</span><input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="field w-full" /></label><label className="space-y-1"><span className="text-xs text-ink-400">Accent color</span><input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent" /></label></div>
        <label className="space-y-1"><span className="text-xs text-ink-400">Photo URL (optional)</span><input type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="field w-full font-mono text-xs" /></label>
      </div>}
      output={<div className="space-y-3">
        <div className="rounded-lg border border-white/[0.06] bg-white p-4"><div dangerouslySetInnerHTML={{ __html: html }} /></div>
        <pre className="field min-h-[8rem] overflow-auto whitespace-pre-wrap font-mono text-[10px] text-cyan-300">{html}</pre>
      </div>}
    />
  );
}
