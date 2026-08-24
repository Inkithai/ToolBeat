# The tool system

How tools are defined, discovered and executed. This describes what is implemented today, not
planned work.

## Layers

| Layer | Path | Responsibility |
| --- | --- | --- |
| Conversion catalog | `src/constants/app.ts` | The original 24 conversions plus `CATEGORIES`. Still the source of truth for converters. |
| Platform types | `src/lib/tools/types.ts` | `ToolDefinition`, the supertype all discovery surfaces consume. |
| Tool registry | `src/lib/tools/registry.ts` | Derives converter tools from the catalog, adds non-converter tools, exposes lookups. |
| Capabilities | `src/lib/tools/capabilities.ts` | Turns capability data into user-facing claims. |
| Conversion dispatch | `src/lib/converters/runners.ts` | Maps a `ConversionType` to a lazily-imported runner. |
| Preferences | `src/lib/storage/preferences.ts` | Namespaced `localStorage` for settings only. |

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

`ToolShell` supplies the back link, heading, summary and capability badges. It does **not** impose an
input/output flow — the three shipped tools have three different shapes (textarea pair, live
statistics, countdown), which is the point.

## Categories and tags

Each tool has exactly one `category` (primary navigation) and any number of free-form `tags`
(cross-cutting discovery). Tags are part of the directory's search corpus, so searching `pdf`
matches every PDF-related tool without needing a PDF category.

`CATEGORIES` is consumed through an exhaustive `Record<CategoryKey, …>` on the landing page, so
adding a category is a deliberate compile error until its presentation is defined.

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

`localStorage` under a `convertlab:` namespace, holding **preferences only** — never tool input.
Converted files, pasted JSON and typed text stay in memory and are gone on reload, which is what the
capability badges claim.

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
