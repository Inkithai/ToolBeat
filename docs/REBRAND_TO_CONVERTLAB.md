# Rebrand: ToolBeat → ConvertLab

_Last updated: 2026-08-26_

ConvertLab is the product's original name (see `docs/BRAND_TRANSITION_SUMMARY.md`
for the earlier ConvertLab → ToolBeat transition). On 2026-08-26 the product
was rebranded back to **ConvertLab**.

## What changed

### Identity

- `src/constants/brand.ts` — `BRAND_NAME_PARTS` back to `{ lead: "Convert", accent: "Lab" }`;
  `APP_NAME` is now `ConvertLab`; `TAGLINE` restored to "Useful tools. Right in your browser."
- Logo mark: the ToolBeat pulse/beat glyph (header/footer wordmark, `src/app/icon.svg`,
  Open Graph artwork) was replaced with an Erlenmeyer flask, the original ConvertLab symbol,
  rendered in the existing white-on-indigo style.
- `src/app/apple-icon.png` (180×180) and `src/app/favicon.ico` (48/32/16) were regenerated
  from the new flask `icon.svg`.
- `src/components/layout/why-toolbeat.tsx` renamed to `why-convertlab.tsx`
  (component `WhyConvertLab`, section `id="why-convertlab"`, footer link updated).
- All user-facing strings referencing the name were updated (aria-labels, the comparison
  table column on the homepage, the JSON validator placeholder, the "Start useful" sample
  text, `package.json` name/description).

### Internal identifiers (renamed)

- Service worker cache: `toolbeat-shell-v1` → `convertlab-shell-v2` (the version bump
  forces every returning PWA client to drop the cached ToolBeat shell).
- In-session custom events: `toolbeat:open-command-palette` → `convertlab:open-command-palette`,
  `toolbeat:tool-activity` → `convertlab:tool-activity`.
- Generated-document internals (invisible to users, not persisted):
  `toolbeat-pdf-*` CSS classes in `src/lib/converters/documents.ts` → `convertlab-pdf-*`,
  and the DOCX ordered-list reference in `src/lib/converters/office.ts` → `convertlab-ordered-list`.
- Test fixtures in `src/lib/converters/data.test.ts` now use "ConvertLab" sample data.

### Deployment

- `.env.example` and README now document `https://convertlab.vercel.app` as the
  production `NEXT_PUBLIC_SITE_URL`.

## What was deliberately NOT changed

| Item | Why |
| --- | --- |
| localStorage namespace `toolbeat:` (`src/lib/storage/preferences.ts`, feedback keys, legacy `toolbeat_toolbox_v1`) | It is persisted in users' browsers. Renaming it would silently wipe returning visitors' favorites, recents and tool preferences on the next deploy. If a rename is ever wanted, ship a one-time migration that copies the old keys to the new ones. |
| `REPOSITORY_URL` (`https://github.com/Inkithai/ToolBeat`) | The GitHub repository has not been renamed; the link must keep resolving. Update this constant (and the README) when the repository is renamed. |
| Indigo color palette | The ToolBeat-era palette (indigo primary on navy/ink) is kept; it predates this decision and works for ConvertLab. The original cyan palette is archived in `docs/BRAND_TRANSITION_SUMMARY.md` if a visual revert is ever desired. |
| Historical docs under `docs/` | `BRAND_TRANSITION_SUMMARY.md` and other archives record what happened at the time; they are not rewritten. |

## Validation

- `npm test` (Vitest), `npm run typecheck`, `npm run lint` and `npm run build` all pass
  after the rename (see the rebrand commit).

## Follow-ups (owner actions, outside this repository)

1. Create/rename the Vercel project to `convertlab` and set
   `NEXT_PUBLIC_SITE_URL=https://convertlab.vercel.app` in its environment.
2. (Optional) Rename the GitHub repository `Inkithai/ToolBeat` → `Inkithai/ConvertLab`,
   then update `REPOSITORY_URL` in `src/constants/brand.ts` and the README link.
