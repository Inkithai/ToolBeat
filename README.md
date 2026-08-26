# ConvertLab

**Useful tools. Right in your browser.**

ConvertLab is a privacy-first toolkit for everyday file conversion, developer utilities, writing helpers and calculators. Every tool runs on-device in your browser — nothing is uploaded to a server.

## Features

- **175 tools** — 32 file converters + 143 utility tools across 8 categories
- **Files & Conversion** — PDF, DOCX, Markdown, HTML, text: convert both ways plus **PDF Merge** and **PDF Split**
- **Images** — PNG/JPG/WebP/SVG conversions plus **Image Compressor**, **Image Resizer**, **Image Cropper**, **Color Picker**, **Dimensions Checker**, **Image → Base64**, **Color Palette from Image**
- **Developer** — JSON/YAML/XML formatters, validators, minifiers (JS via terser, CSS, HTML); JSON → TypeScript/Python/Go/C#/Java/SQL; **JSON Diff**, **HTML → JSX**, **CSS Units Converter**, **Regex Cheatsheet**, **JSON Schema Generator**, **HTTP Headers Reference**, **CORS Explainer**, **Docker Compose Generator**, **package.json Generator**
- **Security** — Hash Generator (MD5 + SHA), Password Generator, JWT Decoder + **Encoder**, UUID Generator + **v5**, **SRI Hash Generator**, **SSH Key Generator**, **X.509 Decoder**, **SQL Injection Checker**, **Password Hash Generator**
- **Web & URLs** — URL encoder/parser, query-string builder, UTM builder, **robots.txt Generator**, **Sitemap Generator**, **OG Meta Tag Generator**, **HTML Meta Tag Generator**
- **Generators** — Color palette, CSS gradient, mock data, barcode, random number, Lorem Ipsum + **Box Shadow**, **Dice Roller**, **Coin Flip**, **Random Picker**, **Favicon Generator**, **API Mock Generator**, **Email Signature Generator**
- **Text & Writing** — Word counter, word frequency, line sorter, Markdown previewer, text case converter, diff, Find & Replace, slug generator, reading time, Pomodoro, Stopwatch + **Countdown Timer**, **Number to Words**, **Markdown Table Generator**, **Password Strength Checker**
- **Calculators** — Percentage, date difference, unit, age, BMI, interest, discount, tip, Loan/EMI, investment, ROI, CAGR, ratio, statistics, Unix Timestamp, Color Converter + **Mortgage**, **Break-even**, **Tax**, **Salary**, **Business Days**, **Aspect Ratio**, **Fuel Cost**, **Retirement**, **Pregnancy Due Date**, **GPA**, **Data Size Converter**, **Font Size Converter**, **Meeting Time Converter**
- **Accessibility** — **WCAG Contrast Checker**, **Color Blindness Simulator**, **Screen Resolution Tester**
- **🤖 AI Tools (BYOK)** — Text Summarizer, Text Rewriter, Regex Generator, SQL Generator, JSON Schema Generator — bring your own OpenAI key, stored locally
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
