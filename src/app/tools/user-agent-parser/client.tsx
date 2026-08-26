"use client";

import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

type ParsedUA = {
  browser: string;
  browserVersion: string;
  engine: string;
  engineVersion: string;
  os: string;
  osVersion: string;
  device: string;
  isMobile: boolean;
  isBot: boolean;
};

const BOT_PATTERNS = [
  /googlebot/i, /bingbot/i, /slurp/i, /yahoo/i, /duckduckbot/i,
  /baiduspider/i, /yandexbot/i, /facebot/i, /ia_archiver/i,
  /crawler/i, /spider/i, /bot\b/i, /scraper/i,
];

function parseUserAgent(ua: string): ParsedUA {
  const result: ParsedUA = {
    browser: "Unknown",
    browserVersion: "",
    engine: "Unknown",
    engineVersion: "",
    os: "Unknown",
    osVersion: "",
    device: "Desktop",
    isMobile: false,
    isBot: false,
  };

  // Check for bots
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(ua)) {
      result.isBot = true;
      const match = ua.match(/([\w-]*bot[\w]*)\b/i) || ua.match(/([\w-]*(?:spider|crawler|scraper)[\w]*)/i);
      result.browser = match ? match[1] : "Bot";
      return result;
    }
  }

  // Browser detection
  if (/Edg\//.test(ua)) {
    result.browser = "Microsoft Edge";
    const m = ua.match(/Edg\/([\d.]+)/);
    result.browserVersion = m ? m[1] : "";
  } else if (/OPR\//.test(ua) || /Opera/.test(ua)) {
    result.browser = "Opera";
    const m = ua.match(/(?:OPR|Opera)\/([\d.]+)/);
    result.browserVersion = m ? m[1] : "";
  } else if (/Brave/.test(ua)) {
    result.browser = "Brave";
  } else if (/Vivaldi/.test(ua)) {
    result.browser = "Vivaldi";
    const m = ua.match(/Vivaldi\/([\d.]+)/);
    result.browserVersion = m ? m[1] : "";
  } else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    result.browser = "Chrome";
    const m = ua.match(/Chrome\/([\d.]+)/);
    result.browserVersion = m ? m[1] : "";
  } else if (/Chromium\//.test(ua)) {
    result.browser = "Chromium";
    const m = ua.match(/Chromium\/([\d.]+)/);
    result.browserVersion = m ? m[1] : "";
  } else if (/Firefox\//.test(ua)) {
    result.browser = "Firefox";
    const m = ua.match(/Firefox\/([\d.]+)/);
    result.browserVersion = m ? m[1] : "";
  } else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
    result.browser = "Safari";
    const m = ua.match(/Version\/([\d.]+)/);
    result.browserVersion = m ? m[1] : "";
  } else if (/MSIE|Trident/.test(ua)) {
    result.browser = "Internet Explorer";
    const m = ua.match(/(?:MSIE |rv:)([\d.]+)/);
    result.browserVersion = m ? m[1] : "";
  }

  // Engine detection
  if (/Gecko\//.test(ua) && /Firefox/.test(ua)) {
    result.engine = "Gecko";
    const m = ua.match(/rv:([\d.]+)/) || ua.match(/Gecko\/([\d.]+)/);
    result.engineVersion = m ? m[1] : "";
  } else if (/AppleWebKit\//.test(ua)) {
    result.engine = "WebKit";
    const m = ua.match(/AppleWebKit\/([\d.]+)/);
    result.engineVersion = m ? m[1] : "";
    if (/Chrome\//.test(ua)) result.engine = "Blink";
  } else if (/Trident\//.test(ua)) {
    result.engine = "Trident";
    const m = ua.match(/Trident\/([\d.]+)/);
    result.engineVersion = m ? m[1] : "";
  }

  // OS detection
  if (/Windows NT 10/.test(ua)) { result.os = "Windows"; result.osVersion = "10/11"; }
  else if (/Windows NT 6\.3/.test(ua)) { result.os = "Windows"; result.osVersion = "8.1"; }
  else if (/Windows NT 6\.2/.test(ua)) { result.os = "Windows"; result.osVersion = "8"; }
  else if (/Windows NT 6\.1/.test(ua)) { result.os = "Windows"; result.osVersion = "7"; }
  else if (/Windows/.test(ua)) { result.os = "Windows"; }
  else if (/Mac OS X/.test(ua)) {
    result.os = "macOS";
    const m = ua.match(/Mac OS X ([\d_.]+)/);
    result.osVersion = m ? m[1].replace(/_/g, ".") : "";
  }
  else if (/Android/.test(ua)) {
    result.os = "Android";
    const m = ua.match(/Android ([\d.]+)/);
    result.osVersion = m ? m[1] : "";
    result.isMobile = true;
  }
  else if (/iPhone/.test(ua) || /iPad/.test(ua)) {
    result.os = "iOS";
    const m = ua.match(/OS ([\d_]+)/);
    result.osVersion = m ? m[1].replace(/_/g, ".") : "";
    result.isMobile = true;
  }
  else if (/Linux/.test(ua)) { result.os = "Linux"; }
  else if (/CrOS/.test(ua)) { result.os = "Chrome OS"; }

  // Device detection
  if (/iPhone/.test(ua)) result.device = "iPhone";
  else if (/iPad/.test(ua)) result.device = "iPad";
  else if (/Android/.test(ua)) {
    result.device = /Mobile/.test(ua) ? "Android Phone" : "Android Tablet";
  }
  else if (/Mobile/.test(ua)) result.device = "Mobile";

  return result;
}

const EXAMPLES = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
];

export default function Client() {
  const [ua, setUa] = useState("");

  const parsed = useMemo(() => {
    if (!ua.trim()) return null;
    return parseUserAgent(ua);
  }, [ua]);

  const rows = parsed ? [
    { label: "Browser", value: parsed.browserVersion ? `${parsed.browser} ${parsed.browserVersion}` : parsed.browser },
    { label: "Engine", value: parsed.engineVersion ? `${parsed.engine} ${parsed.engineVersion}` : parsed.engine },
    { label: "Operating System", value: parsed.osVersion ? `${parsed.os} ${parsed.osVersion}` : parsed.os },
    { label: "Device", value: parsed.device },
    { label: "Mobile", value: parsed.isMobile ? "Yes" : "No" },
    { label: "Bot/Crawler", value: parsed.isBot ? "Yes" : "No" },
  ] : [];

  return (
    <IoWorkspace
      inputLabel="User-Agent string"
      outputLabel="Parsed details"
      status={parsed ? "complete" : "idle"}
      input={
        <div className="space-y-3">
          <textarea
            value={ua}
            onChange={e => setUa(e.target.value)}
            placeholder="Paste a User-Agent string here..."
            rows={4}
            spellCheck={false}
            className="field w-full font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => setUa(navigator.userAgent)}
            className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-ink-300 transition-colors hover:text-white"
          >
            Use my browser&apos;s User-Agent
          </button>
          <div>
            <p className="mb-1.5 text-[10px] font-medium text-ink-500">Examples</p>
            <div className="space-y-1">
              {EXAMPLES.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setUa(example)}
                  className="block w-full truncate rounded-md border border-white/[0.04] bg-white/[0.01] px-2 py-1 text-left font-mono text-[10px] text-ink-500 transition-colors hover:text-ink-200"
                >
                  {example.slice(0, 80)}...
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      output={
        parsed ? (
          <div className="space-y-3">
            {parsed.isBot && (
              <div className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                🤖 This User-Agent is a bot/crawler
              </div>
            )}
            {rows.map(row => (
              <div key={row.label} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <span className="text-xs text-ink-500">{row.label}</span>
                <span className="text-sm font-semibold text-ink-200">{row.value}</span>
              </div>
            ))}
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-ink-500 hover:text-white">Raw User-Agent</summary>
              <pre className="mt-2 overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 font-mono text-[10px] text-ink-400">{ua}</pre>
            </details>
          </div>
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-ink-600">
            Paste a User-Agent string to parse
          </div>
        )
      }
    />
  );
}
