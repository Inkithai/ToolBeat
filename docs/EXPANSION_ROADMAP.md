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

## Stage 2 — 75 → 100

Introduce the **Security & Encoding**, **Web/URL** and **Generators** groupings
(kept inside existing categories until the UI earns sub-categories):

- Minifiers: JS, CSS, HTML (js-beautify is already a dependency)
- Validators: XML, YAML, JSON Schema
- Encoding: HTML entities, Unicode escapes, IP/CIDR
- Web: URL parser, query-string parser, UTM builder/parser, robots.txt generator
- Generators: color palette, CSS gradient, box-shadow, random string, mock data
- Calculators: investment return, ROI, CAGR, ratio, average, standard deviation
- Text: word frequency, text sorter, remove empty lines, Markdown previewer
- QR → SVG output, Barcode Generator

## Stage 3 — 100 → 150

Depth where users demonstrably search:

- PDF: PDF → DOCX fidelity improvements, PDF merge/split (ZIP-based)
- Images: cropper, color picker, dimensions checker, image → Base64
- Developer: JSON → (Python/Go/C#/Java/SQL), cron generator/explainer,
  HTTP status & MIME lookups, user-agent parser
- Calculators: mortgage variants, break-even, tax, salary, business days,
  countdown
- Productivity: dice roller, coin flip, random picker, meeting time converter

## Stage 4 — beyond 150

Add only against evidence (search demand, the Tool Request form, support
questions). Candidates that need a policy decision first:

- AI utilities (summarizer, rewriter, regex/SQL generator) — **bring your own
  key only**, stored locally, never routed through a server
- URL shortener, hosted sitemap generation — need a backend; out of scope for
  the frontend-only phase
- Analytics — must stay consent-free and cookieless, or not at all

## Deliberately not doing

- A "500 random tools" sprawl. The category hierarchy (Files, Images,
  Developer, Text, Calculators, + Security/Web/Generators later) is the
  product; the count is a byproduct.
- Server-side conversion of any kind — the privacy claim is the brand.
- Fake "coming soon" items: the landing-page **On the bench** section only
  lists tools that are genuinely next.
