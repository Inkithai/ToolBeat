# ToolBeat

**Useful tools. Right in your browser.**

ToolBeat is a privacy-first toolkit for everyday file conversion, developer utilities, writing helpers and calculators. Every tool runs on-device in your browser — nothing is uploaded to a server.

## Features

- **24 file converters** — documents, images and data formats (Markdown → PDF, PNG → WebP, JSON → YAML, and more)
- **12 utility tools** — JSON formatter, Base64/URL codecs, JWT decoder, UUID generator, word counter, text case converter, Pomodoro timer, percentage & date calculators, **unit converter**, **reading time calculator**
- **On-device processing** — verified per tool; platform copy is derived from capabilities so it cannot go stale
- **Tool directory** — search, categories, tags, favorites and recently used (localStorage preferences only)
- **SEO-ready** — `metadataBase`, sitemap, robots.txt, JSON-LD and breadcrumbs generated from the tool registry

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
| `NEXT_PUBLIC_SITE_URL` | **Yes in production** | Canonical origin for sitemap, robots, Open Graph, JSON-LD and `metadataBase`. No trailing slash. Production: `https://toolbeat.vercel.app` |

If unset, the app falls back to `http://localhost:3000` so local builds still work — but production search metadata will be wrong until this is set.

## Live site

**https://toolbeat.vercel.app**

## Deploy (Vercel)

Already deployed on Vercel. For a fresh import:

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. Framework preset: **Next.js** (see `vercel.json`).
3. Set **Environment Variable**:
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://toolbeat.vercel.app` (or your custom domain)
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

The product name is **ToolBeat** (repository: [Inkithai/ToolBeat](https://github.com/Inkithai/ToolBeat)). All user-facing strings and the storage namespace (`toolbeat:`) use this name. Historical ConvertLab references remain only in archived assessment docs under `docs/`.

## License

Private project (`package.json`). Adjust as needed before publishing.
