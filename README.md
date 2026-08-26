# ConvertLab

**Useful tools. Right in your browser.**

ConvertLab is a privacy-first toolkit for everyday file conversion, developer utilities, writing helpers and calculators. Every tool runs on-device in your browser — nothing is uploaded to a server.

## Features

- **100 tools** — 32 file converters + 68 utility tools across 8 categories
- **Files & Conversion** — PDF, DOCX, Markdown, HTML, text: convert both ways (PDF → TXT/JPG/PNG/DOCX, DOCX → PDF/Markdown/HTML, HTML → Markdown/PDF, and more)
- **Images** — PNG/JPG/WebP/SVG conversions plus on-device **Image Compressor** and **Image Resizer**
- **Developer** — JSON/YAML/XML formatters and validators (XML, YAML, **JSON Schema**), minifiers (**JS via terser**, CSS, HTML), **HTML entities**, **Unicode escapes**, **IP & CIDR calculator**, SQL/HTML/CSS/JS formatters, JSON → TypeScript, Base64/URL codecs, **QR Code Generator** (PNG **or SVG**), regex tester
- **Security** — **Hash Generator** (MD5 + SHA family), **Password Generator**, **JWT Decoder**, **UUID Generator**
- **Web & URLs** — URL encoder, **URL parser**, **query-string builder**, **UTM builder & parser**, **robots.txt analyzer**
- **Generators** — **color palette**, **CSS gradient**, **mock data** (seedable CSV/JSON), **barcode** (CODE128/CODE39/EAN/UPC, SVG + PNG), random number, Lorem Ipsum
- **Text & Writing** — word counter, **word frequency**, **line sorter & cleaner**, **Markdown previewer**, text case converter, diff, **Find & Replace**, slug generator, reading time, Pomodoro, **Stopwatch**
- **Calculators** — percentage, date difference, unit, age, BMI, interest, discount, tip, **Loan/EMI** (with amortization schedule), **investment**, **ROI**, **CAGR**, **ratio**, **statistics**, **Unix Timestamp**, **Color Converter**
- **On-device processing** — verified per tool; platform copy is derived from capabilities so it cannot go stale
- **Tool directory** — search, categories, tags, favorites and recently used (localStorage preferences only)
- **SEO-ready** — `metadataBase`, sitemap, robots.txt, JSON-LD and breadcrumbs generated from the tool registry
- **Expansion roadmap** — see [`docs/EXPANSION_ROADMAP.md`](docs/EXPANSION_ROADMAP.md)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test          # Vitest unit tests
npm run build     # Production build
npm run lint      # ESLint
```

## Environment

Copy the example env file and set the public site URL for any non-local deploy:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Yes in production** | Canonical origin for sitemap, robots, Open Graph, JSON-LD and `metadataBase`. No trailing slash. Production: `https://convertlab.vercel.app` |

If unset, the app falls back to `http://localhost:3000` so local builds still work — but production search metadata will be wrong until this is set.

## Live site

**https://convertlab.vercel.app**

## Deploy (Vercel)

Already deployed on Vercel. For a fresh import:

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. Framework preset: **Next.js** (see `vercel.json`).
3. Set **Environment Variable**:
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://convertlab.vercel.app` (or your custom domain)
   - Apply to Production (and Preview if you want correct preview canonicals)
4. Deploy.

Other hosts work the same way: build with `npm run build`, serve `npm start`, and inject `NEXT_PUBLIC_SITE_URL`.

## Project layout

```
src/
  app/                  # Next.js App Router pages
    conversion/         # File converters (/conversion/<type>)
    tools/              # Utility tools (/tools/<slug>) + directory
  components/           # Layout, tool shell, SEO helpers
  constants/            # Brand strings + conversion catalog
  lib/
    converters/         # Conversion runners and format helpers
    tools/              # Registry, search, capabilities, pure tool logic
    storage/            # Namespaced localStorage (preferences only)
    seo/                # Metadata + JSON-LD builders
docs/                   # Architecture notes and closed-out audits
```

Adding a **converter**: edit `CONVERSIONS` in `src/constants/app.ts` and add a runner in `src/lib/converters/runners.ts`.

Adding a **utility tool**: append a registry entry in `src/lib/tools/registry.ts` and create `src/app/tools/<slug>/`.

See [`docs/tool-system.md`](docs/tool-system.md) for the full model.

## Branding

The product name is **ConvertLab** (repository: [Inkithai/ToolBeat](https://github.com/Inkithai/ToolBeat) — the repository keeps its historical name). All user-facing strings and metadata derive from `src/constants/brand.ts`. The localStorage namespace intentionally remains `toolbeat:` so returning visitors keep their saved favorites, recents and preferences. Historical references to the previous name, ToolBeat, remain in archived docs under `docs/` (see `docs/REBRAND_TO_CONVERTLAB.md`).

## License

Private project (`package.json`). Adjust as needed before publishing.
