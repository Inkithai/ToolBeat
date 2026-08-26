# Expansion Roadmap

_Last updated: 2026-08-26_

ConvertLab expands as a structured "everyday online utility platform" — small,
focused tools that solve one problem quickly. The target is **100 tools**, not
100+ for its own sake: beyond that, discovery quality matters more than count.

Guiding constraint (unchanged from `IMPLEMENTATION_STATUS.md`): every tool
runs **on-device in the browser**. Nothing that needs an API, a backend, or an
upload goes in the main catalog — at most as a clearly-labelled "bring your
own key" feature.

## Stage 1 — complete the obvious gaps (53 → 75) ✅ shipped 2026-08-26

Converters added (PDF family + document/data gaps):

- PDF → TXT (pdfjs text extraction)
- PDF → JPG (all pages, ZIP bundle)
- PDF → PNG (all pages, ZIP bundle)
- PDF → DOCX (text extraction with heading detection)
- DOCX → PDF (mammoth → html2canvas/jsPDF pipeline)
- HTML → Markdown (turndown, sanitized)
- CSV → XML (composition of the existing CSV→JSON→XML steps)

Utility tools added:

- Image Compressor (canvas re-encode, quality slider, before/after sizes)
- Image Resizer (canvas, aspect-ratio-aware, exact or box target)
- Hash Generator (MD5 built-in, SHA-1/256/384/512 via WebCrypto; text or file)
- QR Code Generator (qrcode, size/color/error-correction, PNG download)
- Loan / EMI Calculator (fixed-rate amortization + year-by-year schedule)
- SQL Formatter (sql-formatter, 12 dialects)
- HTML / CSS / JavaScript Formatters (js-beautify)
- JSON → TypeScript (type inference from a JSON sample)
- Stopwatch (laps/splits)
- Unix Timestamp Converter (both directions, s/ms)
- Color Converter (HEX/RGB/HSL + WCAG contrast)
- Find and Replace (regex, capture groups, live match count)
- Lorem Ipsum Generator (seedable)

New dependencies (all pure JS, dynamically imported where heavy): `pdfjs-dist`,
`turndown`, `qrcode`, `sql-formatter`, `jszip`, `js-beautify`.

Not on the "top 20" list because they already existed: JPG → PNG, WebP → PNG,
CSV → JSON.

## Stage 2 — 75 → 100 ✅ shipped 2026-08-26

The **Security**, **Web & URLs** and **Generators** categories now exist in the
category hierarchy (three new categories; existing tools were re-homed into
them where it fits better, e.g. hash/password/JWT/UUID → Security, URL
Encoder → Web, Random Number Generator → Generators).

25 tools added — exactly 100 total:

- Minifiers: JS (terser), CSS, HTML
- Validators: XML (fast-xml-parser), YAML (js-yaml multi-document), JSON
  Schema (ajv + ajv-formats, draft-07, 20 human-readable errors)
- Encoding: HTML entities (he), Unicode escapes, IP/CIDR calculator
  (IPv4 + IPv6, BigInt math)
- Web: URL parser, query-string builder, UTM builder + parser (tabs),
  robots.txt analyzer (RFC 9309 group specificity)
- Generators: color palette, CSS gradient, mock data (seedable, CSV/JSON),
  barcode (jsbarcode, CODE128/CODE39/EAN/UPC, SVG + PNG download)
- Calculators: investment return (year-by-year table), ROI, CAGR, ratio,
  statistics (mean/median/mode/variance/stddev)
- Text: word frequency, line sorter & cleaner (duplicates + blank lines
  folded in), Markdown previewer (markdown-it, live two-pane)

Features:

- QR Code Generator can now also download **scalable SVG** (PNG kept)
- Text Transform shell gained async transforms (the JS minifier runs terser
  in the browser) with a stale-run guard

New dependencies (all pure JS, dynamically imported into per-tool chunks):
`terser`, `ajv` + `ajv-formats`, `he`, `jsbarcode` (+ `@types/he`,
`@types/jsbarcode` for dev).

Deferred to Stage 3 to land exactly on 100: **box-shadow generator**. The
"random string" roadmap item is satisfied by the existing Random Number /
UUID / Lorem Ipsum generators.

## Stage 3 — 100 → 126 ✅ shipped 2026-08-26

26 tools added — all running on-device in the browser:

- **Generators**: box-shadow generator (carried over from Stage 2), dice roller
  (d4–d100, animated), coin flip, random picker (add/remove/reorder options)
- **PDF**: PDF Merge (combine multiple PDFs), PDF Split (extract pages or
  split each page to ZIP)
- **Images**: image cropper (drag-and-drop overlay), image color picker
  (click-to-pick HEX/RGB), image dimensions checker, image → Base64
- **Developer**: JSON → Python/Go/C#/Java/SQL type generators, cron generator
  & explainer (presets + plain-English output), HTTP status code lookup (all
  common codes), MIME type lookup (50+ types by category), user-agent parser
  (browser, engine, OS, device, bot detection)
- **Calculators**: mortgage calculator (amortization schedule, visual bar),
  break-even, tax (US federal brackets + state), salary, business days,
  countdown timer & stopwatch (with laps)
- **Productivity**: meeting time converter (17+ timezones)

## Stage 4 — beyond 150

Add only against evidence (search demand, the Tool Request form, support
questions). Candidates that need a policy decision first:

- AI utilities (summarizer, rewriter, regex/SQL generator) — **bring your own
  key only**, stored locally, never routed through a server
- URL shortener, hosted sitemap generation — need a backend; out of scope for
  the frontend-only phase
- Analytics — must stay consent-free and cookieless, or not at all

## Deliberately not doing

- A "500 random tools" sprawl. The category hierarchy (Documents, Images,
  Developer, Security, Web & URLs, Generators, Calculators, Utilities) is
  the product; the count is a byproduct.
- Server-side conversion of any kind — the privacy claim is the brand.
- Fake "coming soon" items: the landing-page **On the bench** section only
  lists tools that are genuinely next.
