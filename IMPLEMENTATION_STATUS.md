# Implementation Status

_Last updated: 2026-08-26_

**175 tools** — all running on-device in the browser (except AI tools which use bring-your-own-key with direct browser-to-OpenAI calls).

## Platform overview

| Metric | Value |
|---|---|
| File converters | 32 (PDF, DOCX, Markdown, HTML, image, data formats) |
| Utility tools | 143 (developer, security, web, generators, calculators, text, images) |
| AI tools (BYOK) | 5 (summarizer, rewriter, regex/SQL/schema generators) |
| **Total tools** | **175** |
| Categories | 8 (Files & Conversions, Images, Developer, Security, Web & URLs, Generators, Calculators, Utilities) |
| Test files | 57+ (vitest) |
| Build | Passing (Next.js 15, TypeScript strict, ESLint) |

## Completed stages

All four planned stages shipped on 2026-08-26:

### Stage 1 — 53 → 75 tools
File converters (PDF family + document/data gaps), image compressor/resizer, hash generator, QR code generator, loan/EMI calculator, SQL formatter, HTML/CSS/JS formatters, JSON → TypeScript, stopwatch, Unix timestamp converter, color converter, find & replace, lorem ipsum.

### Stage 2 — 75 → 100 tools
JS/CSS/HTML minifiers, XML/YAML/JSON Schema validators, HTML entities, Unicode escapes, IP/CIDR calculator, URL parser, query-string builder, UTM builder, robots.txt analyzer, color palette generator, CSS gradient generator, mock data generator, barcode generator, investment/ROI/CAGR/ratio/statistics calculators, word frequency, line sorter, Markdown previewer.

### Stage 3 — 100 → 150 tools (two batches)
**Batch 1 (26 tools):** Box-shadow generator, dice roller, coin flip, random picker, PDF merge/split, image cropper/color picker/dimensions/Base64, JSON → Python/Go/C#/Java/SQL, cron generator & explainer, HTTP status lookup, MIME type lookup, user-agent parser, mortgage/break-even/tax/salary/business days/calculators, countdown timer, meeting time converter.

**Batch 2 (24 tools):** JSON diff, JWT encoder, HTML→JSX, CSS units converter, regex cheatsheet, keyboard keycode tester, CSV column extractor, aspect ratio/fuel cost/retirement/pregnancy due date/GPA calculators, number-to-words, data size/font size converters, favicon generator, screen resolution tester, text↔binary converter, date format converter, password strength checker, WCAG contrast checker, JSON minifier, Markdown→HTML, color blindness simulator.

### Stage 4 — 150 → 175 tools
**SEO & Web (5):** Markdown table generator, sitemap.xml generator, robots.txt generator, OG meta tag generator, HTML meta tag generator.

**Developer (10):** JSON Schema generator, HTTP headers reference, CORS explainer, Docker Compose generator, package.json generator, cron validator, API mock generator, AI Regex Generator, AI SQL Generator, AI JSON Schema Generator.

**Security (7):** SRI hash generator, SSH key generator, UUID v5 generator, password hash generator, X.509 decoder, SQL injection checker, email signature generator.

**Images (1):** Color palette from image.

**AI BYOK (5):** Text summarizer, text rewriter, regex generator, SQL generator, JSON Schema generator. All use bring-your-own OpenAI key stored in localStorage with direct browser-to-OpenAI calls.

## Quality & infrastructure

- **Tests:** 57+ vitest test files covering core tool logic (search, validation, conversion, calculations)
- **Type safety:** Strict TypeScript with no `any` in core logic; PDF/AI modules use targeted casts
- **Search:** Token-based AND matching with per-field weights, aliases for discoverability, exact-name bonus
- **SEO:** Dynamic sitemap from registry, robots.txt, JSON-LD (WebApplication per tool, ItemList for directory, BreadcrumbList per page), Open Graph tags
- **PWA:** Service worker with app-shell caching; manifest for standalone install
- **Feedback:** LocalStorage-based thumbs up/down per tool (no backend)
- **Not-found:** Custom 404 page matching brand
- **Bundle:** Code-split per tool; heavy deps (pdfjs, terser, ajv) dynamically imported

## Not yet built (and why)

| Item | Reason |
|---|---|
| URL Shortener | Needs a backend/database |
| Hosted Sitemap Generator | Needs a backend |
| Cookieless Analytics | Needs a policy decision |

## Adding a new tool

**Converter:** Edit `CONVERSIONS` in `src/constants/app.ts`, add a runner in `src/lib/converters/runners.ts`.

**Utility tool:** Create `src/app/tools/<slug>/page.tsx` + `client.tsx`, append entry in `src/lib/tools/registry.ts`.

See [`docs/tool-system.md`](docs/tool-system.md) for the full model.
