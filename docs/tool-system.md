# The tool system

How tools are defined, discovered and executed. This describes what is implemented today, not
planned work.

## Layers

| Layer | Path | Responsibility |
| --- | --- | --- |
| Conversion catalog | `src/constants/app.ts` | The 24 conversions plus `CATEGORIES`. Still the source of truth for converters. |
| Platform types | `src/lib/tools/types.ts` | `ToolDefinition`, the supertype all discovery surfaces consume. |
| Tool registry | `src/lib/tools/registry.ts` | Derives converter tools from the catalog, adds non-converter tools, exposes lookups. |
| Search | `src/lib/tools/search.ts` | Token-based, scored directory search with alias expansion. |
| Capabilities | `src/lib/tools/capabilities.ts` | Turns capability data into user-facing claims. |
| SEO | `src/lib/seo/` | `metadataBase`-derived canonicals, sitemap, robots and JSON-LD built from the registry. |
| Conversion dispatch | `src/lib/converters/runners.ts` | Maps a `ConversionType` to a lazily-imported runner. |
| Preferences | `src/lib/storage/preferences.ts` | Namespaced `localStorage` for settings only. |
| Tool activity | `src/lib/storage/tool-activity.ts` | Favorites and recently-used slugs, same storage rules as preferences. |

## Why two registries and not one

`CONVERSIONS` requires `from`, `to`, `fromFormat`, `toFormat`, `acceptedExtensions` and
`outputExtension`. Those fields are right for a converter and meaningless for a timer. Rather than
loosening the converter type — which would remove the guarantees it currently provides — converter
entries are *derived* into `ToolDefinition` at module load:

```
CONVERSIONS (24 entries, strict converter shape)
        │  derived, never duplicated
        ▼
     TOOLS  ◄── utility tools declared directly
```

Converter-specific fields survive inside a `conversion` payload, so nothing is lost and the two can
never disagree.

## Adding a converter

1. Add an entry to `CONVERSIONS` in `src/constants/app.ts`.
2. Add a runner with the same key to `CONVERSION_RUNNERS` in `src/lib/converters/runners.ts`.

Step 2 is not optional: `CONVERSION_RUNNERS` is typed `Record<ConversionType, ConversionRunner>`, so
omitting it fails the build. This preserves the pre-existing invariant that the UI can never
advertise a conversion with no implementation. The route, static params, metadata, directory card
and landing-page count all follow automatically.

Runners must import their dependencies dynamically:

```ts
"json-to-yaml": textRunner("application/yaml", async (input) =>
  (await import("./data")).jsonToYaml(input)
),
```

This is what keeps a canvas-only image conversion from downloading the YAML, CSV, XML and DOCX
parsers. Before this change the conversion route shipped 210 kB of First Load JS; it now ships
115 kB.

## Adding a non-converter tool

1. Append a `UtilityTool` to `utilityTools` in `src/lib/tools/registry.ts`, declaring its `kind`,
   `category`, `tags` and honest `capabilities`.
2. Create `src/app/tools/<slug>/page.tsx` wrapping your client component in `ToolShell`.
3. Put pure logic in `src/lib/tools/<name>.ts` with a matching `*.test.ts` when the math or parsing
   has edge cases worth locking down.

`ToolShell` supplies breadcrumbs, heading, summary and capability badges. It does **not** impose an
input/output flow — formatters, counters, converters and timers each own their interaction model.

### Deploy note

Set `NEXT_PUBLIC_SITE_URL` in the hosting environment to the public origin (no trailing slash).
Without it, sitemap / canonicals / JSON-LD fall back to `http://localhost:3000`. See `.env.example`
and the root `README.md`.

## Categories and tags

Each tool has exactly one `category` (primary navigation) and any number of free-form `tags`
(cross-cutting discovery). Tags are part of the directory's search corpus, so searching `pdf`
matches every PDF-related tool without needing a PDF category.

`CATEGORIES` is consumed through an exhaustive `Record<CategoryKey, …>` on the landing page, so
adding a category is a deliberate compile error until its presentation is defined.

## Discovery

Directory search lives in `src/lib/tools/search.ts`, not in the component. Queries are tokenized
(AND semantics — every token must match somewhere), each token scores against weighted fields
(name > slug/tags > summary), accepted file extensions are part of the corpus (so `jpeg` finds the
JPG converters), and a small alias map maps natural words (`word` → `docx`) onto formats at the
lowest weight so aliases widen recall but never outrank a direct name match. Ties break
alphabetically for deterministic ordering.

Favorites and recently-used tools are slug lists stored under the same `toolbeat:` localStorage
namespace as other preferences, written through the same guarded read/write helpers, and synced
between mounted components with a window event (plus the `storage` event across tabs). They are
platform-level data — a tool whose capabilities declare `persistence: "none"` still stores nothing
of its own; the star you click lives in the directory, like a browser bookmark. Tool pages record
visits through `RecordToolVisit`, a client leaf rendered by `ToolShell` and the conversion client
so page shells stay server components.

## SEO

`SITE_URL` (from `NEXT_PUBLIC_SITE_URL`, localhost fallback) is the single origin for
`metadataBase`, per-page canonicals, `robots.txt`, the sitemap and every JSON-LD URL. The sitemap,
the directory's `ItemList`, and each tool page's `WebApplication` + `BreadcrumbList` are generated
from the registry, so a registered tool is fully indexed the moment it exists. The privacy
`featureList` in `WebApplication` is derived from tool capabilities exactly like the visible
badges.

## Capabilities

Every tool declares:

- `processing`: `on-device` or `server`
- `requiresNetwork`: whether it makes network requests while running
- `persistence`: `none` or `preferences`
- `maxFileSizeMb`: for tools that accept files

All shared copy about privacy is **computed** from these values via `describePlatformProcessing`.
Previously the app asserted "Everything runs in your browser" in five separate files; those claims
were true, but nothing kept them true. Adding one server-backed tool now downgrades the wording
automatically instead of turning the footer into a lie.

Per-tool badges come from `getCapabilityBadges` and render via `CapabilityBadges`.

## Storage

`localStorage` under a `toolbeat:` namespace, holding **preferences only** — never tool input.
Converted files, pasted JSON and typed text stay in memory and are gone on reload, which is what the
capability badges claim. The one thing stored beyond per-tool settings is the directory's own
favorites/recents slug lists (see Discovery), which contain no user content either.

`usePersistentState` applies stored values in an effect rather than during render, avoiding
hydration mismatches, and fails silently when storage throws (private mode, quota).

IndexedDB was considered and rejected: nothing here stores anything large or needs asynchronous
access.

## Routing

Unchanged this session. Converters remain at `/conversion/<type>` (all 24 URLs, still statically
generated with per-tool metadata); new tools live at `/tools/<slug>`. Because every surface now reads
`tool.href` from the registry, consolidating these later is a registry change rather than a
site-wide edit.

## Tests

`npm test` runs Vitest. Coverage is deliberately targeted at logic where a silent wrong answer is
worse than a crash — the data converters, document text helpers, word-count rules, preference
storage, and registry totality. `renderHtmlToPdfBlob` is not unit tested because it depends on real
layout metrics that jsdom does not implement; testing it against a fake would assert the fake.
