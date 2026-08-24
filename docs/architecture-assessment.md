# ConvertLab → ToolBeat: Architecture Assessment

**Date:** 24 August 2026
**Repository:** `Inkithai/ConvertLab` @ `3d99850`
**Scope:** Full read-only inspection of the existing codebase, plus a conceptual (read-only,
out-of-tree) review of `Inkithai/DigiBeat` as an architectural reference.
**Status:** Assessment only. No production source files were modified to produce this document.

---

## 0. Method and evidence base

Everything below is derived from the actual repository, not from assumptions:

- Every file under `src/` was read (20 files, 2,926 lines including binary assets).
- `npm run build` and `npm run lint` were executed to capture real bundle and route data.
- `npx tsc --noEmit` was executed to confirm the type baseline is clean.
- DigiBeat was cloned to `/tmp` (**outside** this repository, never committed) and read for
  conceptual patterns only. No DigiBeat code has been copied.

**Baseline health: the project is in good shape.** Build succeeds, lint is clean, types are clean,
33 pages prerender. This is not a rescue operation; it is an extension problem.

---

## 1. What exists today

### 1.1 Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15.5 (App Router) | `next dev --turbopack` |
| UI | React 19.1 | Function components, no state library |
| Language | TypeScript 5.8, `strict: true` | Path alias `@/* → ./src/*` |
| Styling | Tailwind CSS v4 (`@theme` in `globals.css`) | No `tailwind.config`, CSS-first tokens |
| Icons | `lucide-react` | |
| Conversion libs | `markdown-it`, `js-yaml`, `papaparse`, `fast-xml-parser`, `mammoth`, `docx`, `jspdf`, `html2canvas` | All run in the browser |
| Tests | **none** | No runner in `devDependencies` |
| PWA | **none** | No `public/`, no manifest, no service worker |

### 1.2 Route map (from real build output)

```
○ /                        3.18 kB   110 kB First Load
○ /conversion              124 B     103 kB   (redirect → /tools)
● /conversion/[type]        104 kB   211 kB   24 prerendered paths
ƒ /tools                   3.52 kB   110 kB   (dynamic: reads searchParams)
○ /_not-found
```

### 1.3 Module map

```
src/
├── app/
│   ├── layout.tsx                       root shell — <html>/<body> only, no Header/Footer
│   ├── page.tsx                         landing: hero + category cards + how-it-works
│   ├── hero-format-picker.tsx           "use client" from/to picker (landing)
│   ├── globals.css                      Tailwind v4 @theme tokens, focus-visible, reduced-motion
│   ├── tools/
│   │   ├── page.tsx                     directory shell + metadata
│   │   └── tool-directory.tsx           "use client" search + 3 filters + grid
│   └── conversion/
│       ├── page.tsx                     redirect("/tools")
│       ├── conversion-picker.tsx        "use client" — currently UNUSED (see §3.9)
│       └── [type]/
│           ├── page.tsx                 generateStaticParams + generateMetadata
│           └── conversion-client.tsx    604 lines — the entire converter runtime
├── components/layout/{header,footer}.tsx
├── constants/app.ts                     CONVERSIONS registry (24) + CATEGORIES (3)
├── lib/converters/{data,documents,office}.ts   1,252 lines of pure logic
└── types/declarations.d.ts              hand-written module shims
```

### 1.4 Catalog shape

`src/constants/app.ts` holds 24 conversions across 3 categories
(documents 9, images 7, developer 8), typed as:

```ts
type ConversionDefinition = {
  from; to; fromFormat; toFormat; category;
  description; acceptedExtensions; outputExtension;
};

export const CONVERSIONS = { ... } as const satisfies Record<string, ConversionDefinition>;
export type ConversionType = keyof typeof CONVERSIONS;
export function isConversionType(value: string): value is ConversionType;
```

---

## 2. Strengths — what must be preserved

These are genuine assets. The platform work should build **on** them, not replace them.

1. **A real single-source-of-truth registry already exists.** `CONVERSIONS` drives the landing
   category counts, the hero picker, the tools directory, related-tool lists, `generateStaticParams`
   and `generateMetadata`. The `as const satisfies` pattern gives literal key typing *and* shape
   checking — this is exactly the pattern a `ToolDefinition` registry needs. **The registry concept
   in Step 4 of the brief is not new work here; it is a generalisation of something that works.**

2. **A discipline of "discovery cannot outrun implementation."** The comment in `app.ts` is
   enforced structurally: the union type `ConversionType` and the `isConversionType` guard mean an
   advertised tool that has no route is a compile error. This invariant is worth keeping verbatim
   in the tool registry.

3. **Conversion logic is already pure and framework-free.** `src/lib/converters/*` imports zero
   React and zero Next.js. It is directly unit-testable today with no refactor. This is the
   highest-value, lowest-risk test target in the repo.

4. **Dynamic-import discipline for heavy dependencies is already present.**
   `documents.ts:129-130` lazy-loads `jspdf` and `html2canvas`; `office.ts:32` lazy-loads `docx`.
   The instinct required by Step 15 already exists — it just is not applied uniformly (§3.2).

5. **Per-tool SEO already works.** `/conversion/[type]/page.tsx` emits a distinct title,
   description, canonical and OpenGraph block per converter, and prerenders all 24.

6. **Accessibility is not an afterthought.** `globals.css` ships a `:focus-visible` ring and a
   `prefers-reduced-motion` block; the dropzone is keyboard-activatable with an accurate
   `aria-label`; `aria-live="polite"` announces conversion state; errors use `role="alert"`.

7. **Input safety is real, not decorative.** 50 MB limit, empty-file rejection, extension
   allowlist per conversion, a 40-megapixel canvas guard, `sanitizeDocument()` in the PDF path,
   `markdown-it` configured with `html: false`, and a custom `validateLink`.

8. **Prior UX analysis exists and was acted on.** `UX_AUDIT.md` and `LANDING_PAGE_UI_AUDIT.md`
   document the reasoning behind the current IA (category cards → filtered directory, format-first
   hero). ToolBeat should not silently reverse those decisions.

---

## 3. Limitations — where this becomes hard to extend

Each item below is a concrete, located finding, ordered by impact on the platform goal.

### 3.1 The 24-case `switch` is the extension bottleneck — **highest impact**

`conversion-client.tsx:229-330` is a single `switch (type)` that hard-wires every converter.
Adding a converter requires editing a 604-line client component. Adding a *non-converter* tool
(a timer, a formatter) has no path through this file at all. This is the one structural change
the platform genuinely requires: **execution must be resolvable from the registry, not from a
`switch` in a page component.**

The same file also mixes six responsibilities: page chrome, dropzone, validation, preview,
dispatch, settings, and tool-switching UI.

### 3.2 Every converter pays for every converter's dependencies

`conversion-client.tsx` statically imports all three converter modules, so `markdown-it`,
`js-yaml`, `papaparse`, `fast-xml-parser` and `mammoth` land in one shared chunk.

Real evidence: `/conversion/[type]` is **104 kB route JS / 211 kB First Load**, against 110 kB for
every other route. A `png-to-jpg` conversion — pure `<canvas>`, zero libraries — currently
downloads a YAML parser, a CSV parser, an XML parser and a DOCX reader.

This scales badly in exactly the direction the brief cares about: 50 tools built this way means a
50-tool bundle on every tool page.

### 3.3 Capability claims are hard-coded in the shell, not derived per tool

"Everything runs in your browser", "Nothing leaves your device", "Browser-only" and
"Private & browser-based" appear in `layout.tsx` metadata, `footer.tsx`, `page.tsx`,
`tools/page.tsx` and `conversion-client.tsx`. Today every claim is **true**. The moment one tool
needs a network or a server, the claim becomes false site-wide and there is no mechanism to
qualify it. Rule 14 of the brief ("no unsupported privacy/offline claims") is currently satisfied
by luck rather than by architecture.

Capabilities must become tool-level data that the UI renders, not global copy.

### 3.4 The type model conflates "conversion" with "tool"

`ConversionDefinition` makes `from`, `to`, `fromFormat`, `toFormat`, `acceptedExtensions` and
`outputExtension` **mandatory**. None of those are meaningful for a Pomodoro timer, a word counter
or a UUID generator. A tool registry cannot reuse this type; it needs a common supertype
(identity, category, SEO, capabilities) with conversion-specific fields in an extension.

### 3.5 Tool options are hard-coded conversion heuristics

`pageSize`, `font` and `imageQuality` are `useState` in the client, shown via
`hasPdfSettings = conversion.toFormat === "PDF"` and
`hasQualitySetting = category === "images" && ["JPG","WebP"].includes(toFormat)`
(`conversion-client.tsx:365-366`). Adding an option means editing the shared component and adding
another heuristic. Options belong to the tool definition.

### 3.6 No application shell

`layout.tsx` renders only `<html>/<body>`. `Header` and `Footer` are imported separately by
`page.tsx`, `tools/page.tsx` and `conversion-client.tsx`. Consequences: the built-in `/_not-found`
page has no chrome at all, and the nav is hard-coded to converter language ("Start Converting").
There is no mobile nav, no breadcrumbs, no theme control, no command palette mount point.

### 3.7 Categories are closed and coupled to the landing page

`CATEGORIES` is a 3-entry `as const` tuple, and `page.tsx:8-12` declares
`Record<CategoryKey, {icon, color, border, iconColor}>`. Because the `Record` is exhaustive,
adding a category is a **compile error until the landing page is edited**. That is good safety and
bad extensibility — the styling metadata should live with the category definition.

Also note the current categories are *format families* (documents/images/developer), not the
platform categories the brief describes (Developer / Productivity / Calculators / …). These are
different axes and will need reconciling.

### 3.8 No persistence, no PWA, no tests, no sitemap

- `grep localStorage src/` → **zero hits.** No theme, favorites, recents or preferences.
- No `public/`, no `manifest`, no service worker, no offline story.
- No test runner at all. The purest, most valuable code in the repo (`lib/converters`) is untested.
- No `sitemap.ts`, no `robots.ts`, no `metadataBase` (so the `alternates.canonical` values in
  `/conversion/[type]` resolve relative and OG images cannot be absolute), no JSON-LD, no
  breadcrumbs, and no per-category routes.

### 3.9 Smaller findings

- `src/app/conversion/conversion-picker.tsx` (124 lines) is **dead code** — nothing imports it;
  `/conversion` redirects to `/tools`. It duplicates `hero-format-picker.tsx`.
- `types/declarations.d.ts` hand-writes shims for `js-yaml`, `papaparse`, `markdown-it` and
  `mammoth` instead of using `@types/*`. `parse(input, options: Record<string, unknown>)` in
  particular discards type safety at a parsing boundary.
- `next.config.js` still carries `images: { unoptimized: true }`, a leftover from a removed
  `output: "export"`. Harmless today; misleading later.
- `/tools` is `ƒ` (server-rendered per request) purely because it awaits `searchParams`. Fine, but
  it means the directory is not statically cached and there are no indexable category pages.
- `revokeConvertedUrl` / object-URL lifecycle handling in `conversion-client.tsx` is correct and
  worth extracting as shared infrastructure rather than rewriting per tool.

---

## 4. Classification against the brief's Step 2 questions

| # | Question | Answer, with evidence |
|---|---|---|
| 1 | **Preserve** | `lib/converters/*` (all 1,252 lines), the 24-entry catalog and its data, the `as const satisfies` registry pattern, the `isConversionType` guard invariant, per-tool `generateMetadata`/`generateStaticParams`, the a11y baseline in `globals.css`, the Tailwind v4 `@theme` token set, all existing `/conversion/*` URLs |
| 2 | **Generalise** | The registry (`CONVERSIONS` → `ToolDefinition` + `ConverterTool extends ToolDefinition`), the directory/search/filter UI in `tool-directory.tsx`, `Header`/`Footer` → real app shell, the dropzone + object-URL + error/loading conventions in `conversion-client.tsx` |
| 3 | **Stay conversion-specific** | Format pairing (`from`/`to`), extension allowlists, output filename derivation, PDF page-size/font options, image quality, source-preview logic, the swap-direction and format-family switcher |
| 4 | **Becomes platform-level** | Tool registry + lazy resolution, categories & tags, capability labels, search/command palette, storage layer, PWA shell, SEO helpers (sitemap/robots/JSON-LD/breadcrumbs), shared state conventions (idle→processing→success/error) |
| 5 | **Defer** | Rewriting the PDF renderer, replacing hand-written `.d.ts` shims, replatforming `/tools` to static category routes, IndexedDB, batching/chaining, any backend |
| 6 | **Hard to extend** | §3.1 switch dispatch, §3.2 shared bundle, §3.5 option heuristics, §3.7 exhaustive category `Record` |
| 7 | **Reusable components** | `tool-directory.tsx` (filter model), `Header`/`Footer`, the dropzone block, the result/download panel, the related-tools panel |
| 8 | **Tightly coupled to conversion** | `conversion-client.tsx` in its entirety; `ConversionDefinition`; landing-page `categoryStyles`; all shell copy |
| 9 | **Reusable infrastructure** | Object-URL lifecycle, file validation (size/extension/empty), text-preview truncation, blob download, error normalisation (`caughtError instanceof Error`) |
| 10 | **Technical risks** | §5 below |

---

## 5. Technical risks

| Risk | Severity | Evidence / mitigation |
|---|---|---|
| Bundle growth as tools are added | **High** | Already visible: 211 kB First Load on `/conversion/[type]`. Mitigate with per-tool `next/dynamic` at the registry boundary. |
| Breaking the 24 prerendered `/conversion/*` URLs | **High** | They are indexable and linked from every surface. Any route change must keep them working (redirect or dual-route + canonical), never 404. |
| Regressing the PDF pipeline | **High** | `documents.ts` is 650 lines of delicate `html2canvas` + pagination logic with hard-won comments. It should be moved/rewired but **not** rewritten. |
| Over-abstracting into one universal tool UI | **Medium** | The brief warns about this twice. Abstraction should target *platform concerns* (registry, shell, capabilities, storage, SEO), and stop at the tool's own UI. |
| False offline/privacy claims after PWA work | **Medium** | Fix by making capabilities tool-level data (§3.3) **before** adding a service worker. |
| Category-axis conflict (format families vs. platform categories) | **Medium** | Needs a product decision, see §7 Q2. |
| No test safety net during refactor | **Medium** | Land converter unit tests **before** rewiring dispatch, not after. |
| Hand-written module shims drifting from real APIs | **Low** | Contained to 4 modules; replace opportunistically. |

---

## 6. What DigiBeat is (and is not) useful for

Read-only review of `Inkithai/DigiBeat` (React 18 + Vite + react-router SPA, static GitHub Pages,
3 runtime dependencies, no tests).

**Conceptually useful, worth adapting — not copying:**

- **Capability-shaped tools.** Six tools (clock/timer/stopwatch/alarm/pomodoro/world-clock) that
  are pure client state — good proof that a tool platform must not assume file-in/file-out.
- **`localStorage`-backed preferences with a single namespaced key** (`digibeat-settings`), merged
  over defaults at mount, plus URL-parameter overrides for shareable configuration.
- **A minimal hand-written service worker** with stale-while-revalidate and a navigation fallback,
  plus a manifest — the smallest viable PWA, no Workbox dependency.
- **Timer/stopwatch/pomodoro hook shapes** as a reference for what a non-file tool needs
  (`start`/`pause`/`reset`, derived display fields).

**Explicitly not applicable:**

- Vite/react-router/SPA architecture — ConvertLab's App Router + SSG is strictly better for the
  SEO requirements in Step 14.
- Its global `ClockContext` singleton — a platform must not put per-tool state in one global
  context; that is precisely the coupling to avoid.
- Its known defects (manifest icon/`start_url` mismatch, external QR API call, `setInterval`
  drift in timers, inline style objects). Its own `docs/architecture.md` documents several.

---

## 7. Open questions requiring a decision before destructive changes

These are the only places where I would be guessing, and each has irreversible consequences:

**Q1 — Routing.** `/conversion/[type]` has 24 prerendered, indexable URLs.
Options: (a) keep `/conversion/*` canonical forever and add `/tools/[slug]` for new tool types;
(b) make `/tools/[slug]` canonical for everything and 308-redirect `/conversion/*`;
(c) dual-route with canonical pointing at `/tools/[slug]`.
There is precedent for redirects in-repo (`/conversion` → `/tools`). Also note `/tools` currently
means *directory*, so `/tools/[slug]` collides conceptually with the existing listing page.

**Q2 — Category axis.** Existing categories are format families (documents/images/developer);
the brief lists platform categories (Developer/Productivity/Calculators/…). Do converters keep
their sub-grouping under a single "File & Conversion" platform category, or are they promoted to
top level alongside the new ones?

**Q3 — Branding.** Rename user-visible "ConvertLab" → "ToolBeat" now, or keep ConvertLab branding
until enough non-converter tools exist to justify it? (The repo, package name and GitHub URL are
`ConvertLab`; renaming those is a separate, larger decision.)

**Q4 — Scope of this session.** How far should I go now — assessment only, or assessment plus the
non-destructive foundations (registry + shell + lazy loading + tests + 2–3 representative tools)?

---

## 8. Proposed phased strategy

Sequenced so that every phase leaves the app shippable, and the risky phases are protected by
tests landed earlier.

| Phase | Work | Destructive? | Rationale |
|---|---|---|---|
| **0** | This assessment | No | Done |
| **1** | Test harness (Vitest) + unit tests for `lib/converters` | No | Safety net **before** dispatch rewiring (§5) |
| **2** | Platform types: `ToolDefinition` + `ConverterTool extends ToolDefinition`; derive the tool registry from the existing `CONVERSIONS` data without editing converter logic | No | Generalises §3.4 while keeping one source of truth |
| **3** | Capability model (`clientSide` / `offline` / `fileInput` / `textInput` / `networkRequired`) as tool data; replace hard-coded shell claims with rendered capability badges | No | Unblocks §3.3, prerequisite for PWA |
| **4** | App shell: `Header`/`Footer` into `layout.tsx`, platform nav, breadcrumbs, `/_not-found` chrome | Low | Fixes §3.6; must preserve conversion-client's own not-found branch |
| **5** | Registry-driven lazy execution: replace the `switch` with per-tool `next/dynamic` + a converter handler map; measure the bundle before/after | **Yes — needs Q1/Q4** | Fixes §3.1 and §3.2, the core blocker |
| **6** | Storage layer (namespaced `localStorage`, SSR-safe, versioned) → theme, recents, favorites | No | Smallest thing that satisfies Step 10; no IndexedDB until a tool needs it |
| **7** | Representative tools across three shapes: JSON Formatter (text→text), Word Counter or Percentage Calculator (input→result), Pomodoro/Stopwatch (stateful, no I/O) | No | Validates the abstraction per Step 20 |
| **8** | Discovery: unified search across all tool types, category pages, ⌘K palette, recents/favorites surfacing | No | Depends on 2, 6, 7 |
| **9** | SEO: `metadataBase`, `sitemap.ts`, `robots.ts`, JSON-LD, breadcrumb markup | No | Cheap once the registry exists |
| **10** | PWA: manifest, service worker, capability-driven offline, update handling | Low | Only after phase 3, so claims stay honest |
| **11** | Docs (`tool-system.md`, `privacy.md`, `pwa.md`, `contributing.md`) + polish | No | Reflects what shipped, not what was planned |

Phases 1–4 and 6–9 are additive and reversible. **Phase 5 is the only one that touches working
conversion code**, which is why Q1 and Q4 should be settled first.

---

## 9. Bottom line

ConvertLab is a well-built, small, healthy application whose core pattern — a typed, single-source
registry that drives discovery, routing and SEO — is *already* the right pattern for a tool
platform. It has three real structural blockers: a hard-coded `switch` dispatch, a shared
all-converters bundle, and a type model plus shell copy that assume every tool is a file
conversion.

The correct move is not a rewrite. It is to **generalise the registry, make execution lazy and
data-driven, and make capability claims per-tool** — then prove the abstraction with two or three
deliberately dissimilar tools before building anything else.

---

## 10. Implementation record (phases 1-7)

Added after the work landed, so this document does not describe a plan that diverged from reality.

| Phase | Commit | Outcome |
| --- | --- | --- |
| 1 | `909ef37` | Vitest harness; 44 converter tests. Documented the unreachable duplicate-header guard in `data.ts` instead of silently changing behaviour. |
| 2-4 | `ae8b2dd` | `brand.ts`, `lib/tools/{types,capabilities,registry}`, app shell hoisted into `layout.tsx`. |
| 5 | `f16e6a4` | `switch` replaced by `CONVERSION_RUNNERS`; per-runner dynamic imports. |
| 6 | `fdf8b65` | Namespaced `localStorage` preferences + `usePersistentState`. |
| 7 | `427bed1` | `ToolShell`, `CapabilityBadges`, three dissimilar tools, directory generalised to all tools. |

### Measured results

| Metric | Before | After |
| --- | --- | --- |
| `/conversion/[type]` First Load JS | 211 kB | 115 kB |
| Route JS for that page | 104 kB | 9.45 kB |
| Static pages | 33 | 36 |
| Tests | 0 | 67 |
| Hard-coded privacy claims | 5 sites | 0 (all derived) |
| Conversion URLs | 24 | 24 (unchanged) |

### Deviations from section 8

- **Phase 5 was not risky in practice.** The switch was pure dispatch with no shared state, so it
  was replaced wholesale rather than incrementally. Behaviour is pinned by `runners.test.ts`.
- **A fourth category, `utilities`, was added.** Filing a Pomodoro timer under "Data & Developer"
  would have been dishonest categorisation to avoid a one-line change.
- **Phases 8-11 (SEO, PWA, docs polish) were not started.** The PWA phase in particular should stay
  blocked until offline behaviour is verified per tool, since an install prompt implies an offline
  promise the converters have not yet been proven to keep.

### Still open

- `src/app/conversion/conversion-picker.tsx` remains unreferenced dead code. Left in place because
  deleting it was outside the authorised scope.
- File handling helpers (`outputFileName`, object-URL lifecycle, validation, download) still live
  inside `conversion-client.tsx`. They should be extracted when a *second* file-based tool exists —
  not before, since one caller is not evidence of a shared abstraction.
- The unreachable CSV header guard in `data.ts:23`.

