"use client";

import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

function htmlToJsx(html: string): string {
  return html
    .replace(/class=/g, "className=")
    .replace(/for=/g, "htmlFor=")
    .replace(/tabindex=/g, "tabIndex=")
    .replace(/readonly=/g, "readOnly=")
    .replace(/maxlength=/g, "maxLength=")
    .replace(/cellpadding=/g, "cellPadding=")
    .replace(/cellspacing=/g, "cellSpacing=")
    .replace(/colspan=/g, "colSpan=")
    .replace(/rowspan=/g, "rowSpan=")
    .replace(/enctype=/g, "encType=")
    .replace(/accesskey=/g, "accessKey=")
    .replace(/autocomplete=/g, "autoComplete=")
    .replace(/autofocus=/g, "autoFocus=")
    .replace(/autoplay=/g, "autoPlay=")
    .replace(/<br>/g, "<br />")
    .replace(/<br\/>/g, "<br />")
    .replace(/<hr>/g, "<hr />")
    .replace(/<hr\/>/g, "<hr />")
    .replace(/<img([^>]*)>/g, "<img$1 />")
    .replace(/<input([^>]*)>/g, "<input$1 />")
    .replace(/<meta([^>]*)>/g, "<meta$1 />")
    .replace(/<link([^>]*)>/g, "<link$1 />")
    .replace(/style="([^"]*)"/g, (_, style) => {
      const jsxStyle = style.split(";").filter(Boolean).map((rule: string) => {
        const [key, ...valueParts] = rule.split(":");
        if (!key || valueParts.length === 0) return "";
        const camelKey = key.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        const value = valueParts.join(":").trim();
        const numericValue = value.replace(/px$/, "");
        if (/^\d+(\.\d+)?$/.test(numericValue) && !["zIndex", "opacity", "fontWeight", "lineHeight"].includes(camelKey)) {
          return `${camelKey}: ${numericValue}`;
        }
        return `${camelKey}: "${value}"`;
      }).filter(Boolean).join(", ");
      return `style={{ ${jsxStyle} }}`;
    });
}

export default function Client() {
  const [html, setHtml] = useState('<div class="container">\n  <label for="name">Name</label>\n  <input type="text" id="name" class="field" />\n  <br>\n  <img src="logo.png" alt="Logo">\n  <div style="color: red; font-size: 14px;">Hello</div>\n</div>');

  return (
    <IoWorkspace
      inputLabel="HTML"
      outputLabel="JSX (React)"
      status={html ? "complete" : "idle"}
      input={
        <textarea
          value={html}
          onChange={e => setHtml(e.target.value)}
          rows={14}
          spellCheck={false}
          className="field w-full font-mono text-xs"
          placeholder="<div class=&quot;container&quot;>...</div>"
        />
      }
      output={
        <pre className="field min-h-[14rem] overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-cyan-300">
          {htmlToJsx(html)}
        </pre>
      }
    />
  );
}
