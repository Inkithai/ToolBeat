# ConvertLab Landing Page UI Audit

**Route reviewed:** `/`  
**Review date:** 26 July 2026  
**Scope:** Landing-page UI, visual hierarchy, responsiveness, accessibility cues, and the path into a conversion.

## Summary

The landing page has a polished, cohesive dark utility-product look. The cyan accent, strong typography, and browser-local privacy message create a credible first impression. Its most important job—getting a user into the format picker—is now clear: the hero and closing CTA both go to `/conversion`.

The main opportunity is **focus and information density**. The page asks users to read several large marketing sections before giving them the most useful evidence: which exact conversions are available. It also repeats the privacy promise in four places while the primary task (choose an input and output format) remains one click away instead of embedded in the landing experience.

**Overall assessment:** visually strong foundation; task discovery and mobile scanability need the next round of attention.

| Area | Assessment | Priority |
|---|---|---|
| Visual consistency | Strong | Maintain |
| First-action clarity | Good | Improve |
| Tool discovery | Good, but delayed | High |
| Mobile efficiency | Fair | High |
| Accessibility semantics | Fair | Medium |
| Trust communication | Strong but repetitive | Medium |

---

## What is working well

### 1. Clear visual system
- The navy background, restrained translucent panels, cyan accent, and rounded cards are used consistently.
- The primary CTA has the clearest visual weight and a visible hover state.
- Section headings, labels, and card styling make the page easy to segment on desktop.

### 2. Strong above-the-fold proposition
- The hero combines a memorable headline with the meaningful differentiator: conversion happens in the browser.
- “Start Converting” has a direct, useful destination (`/conversion`), rather than locking users into a single conversion type.
- The secondary “Browse Formats” action provides a lower-commitment route for users who are still exploring.

### 3. Useful conversion discovery routes
- Category cards link to filtered tool-directory views rather than arbitrary individual tools.
- The “Popular conversions” list gives users direct routes to common tasks.
- The tool directory supports search, category selection, and source/destination filtering, so the landing-page links have a practical destination.

### 4. Trust and reassurance
- Privacy, local processing, no accounts, and speed are easy to notice.
- The simple three-step explanation reduces uncertainty for a first-time user.

---

## Findings and recommendations

| # | Finding | Why it matters | Severity | Recommendation |
|---|---|---|---|---|
| 1 | The landing page is marketing-led before it is task-led. The format selector is only available after navigation to `/conversion`. | Most visitors arrive with a concrete file task. An extra page transition slows the highest-value flow. | High | Add a compact **From → To** picker directly below the hero CTAs, or replace the secondary CTA with an inline “Choose formats” control. Keep its Continue action routed to the selected converter. |
| 2 | The hero uses large vertical spacing (`pt-32`, `pb-20`) and a very large desktop heading. | On laptop-height viewports, the next useful content is pushed below the fold. On mobile, users must scroll before seeing supported formats. | High | Reduce hero top/bottom padding at `sm` and below; cap the heading more conservatively on mid-size screens. Aim to show the hero CTA and the start of a format-discovery affordance in the first viewport. |
| 3 | Privacy is repeated in the hero badge, hero copy, value card, category intro, how-it-works content, and footer. | Repetition weakens hierarchy and uses vertical space that could show format availability or limitations. | Medium | Keep the strongest form in the hero and use shorter supporting references elsewhere. Replace one repeated block with “Supported conversions” or a concise compatibility note. |
| 4 | “Universal Coverage” overstates the product’s current finite converter set. | Users can infer that any file type is supported, then encounter a missing tool. This can reduce trust. | High | Change to “Growing format coverage” or “Documents, images, data, and developer formats.” Link directly to the tool directory and, ideally, show the current tool count from the conversion registry. |
| 5 | Category descriptions list overlapping or broad formats: for example, Markdown appears in Documents and Text; developer/data boundaries are not immediately clear. | Users may not know which family to choose and can doubt whether a conversion exists. | Medium | Make each category’s label and examples reflect its exact contents, or consolidate overlapping categories. Add a visible conversion count (e.g. “6 tools”) to each card. |
| 6 | Category cards rely partly on hover to reveal their arrow affordance. | Touch users never receive hover feedback, and the cards do not state their destination clearly enough by default. | Medium | Keep a subtle arrow or “View tools” label visible at all times; reserve motion for enhancement rather than meaning. |
| 7 | The five-category grid creates uneven wrapping at intermediate widths. | At tablet widths the card sequence can look accidental, and cards may become visually dense. | Medium | Use 2 columns on small screens, 3 columns at medium widths, and 5 columns only on wide desktop; or use a horizontally scrollable chip row for category shortcuts. |
| 8 | The “Browse Formats” CTA jumps to a lower section instead of the searchable tools directory. | Users looking for a specific conversion may expect a searchable list, not a long scroll to categories. | Medium | Rename it to “Explore categories” if it remains an anchor. Otherwise point it to `/tools` and use “Browse all tools.” |
| 9 | The footer says “Open source,” but the landing page does not offer a repository or license link. | A trust claim should be verifiable. | Low | Add a GitHub link (and license link where appropriate), or remove the claim until those destinations exist. |
| 10 | The page contains meaningful decorative animation and transitions but no reduced-motion treatment is defined in the local styles. | Motion-sensitive users may prefer a static experience. | Medium | Add a `prefers-reduced-motion: reduce` rule that disables the fade-up animation and nonessential transforms. |
| 11 | Icon-only decorative treatment is visually helpful, but the page could communicate current coverage more concretely. | Prospective users benefit more from exact examples than generic value statements. | Medium | Add a compact “Popular formats” row near the hero: PDF, DOCX, PNG, JPG, JSON, CSV, XML, YAML—only for formats represented in the registry. |

---

## Recommended page order

1. **Header** — logo, Conversion, All Tools, How It Works.
2. **Hero** — privacy badge, task-oriented headline, short promise.
3. **Inline conversion picker** — From, To, Continue; this is the primary interaction.
4. **Trust micro-copy** — “Processed locally · No account · Free.”
5. **Popular conversions** — six direct conversion links.
6. **Category shortcuts** — labeled with accurate examples and tool counts.
7. **How it works** — only after the user can start the task.
8. **Closing CTA** — route to the picker/tool directory.
9. **Footer** — privacy statement and verifiable project links.

This order puts completion before explanation while retaining the product’s trust narrative.

---

## Responsive guidance

### Mobile
- Keep the initial hero compact enough that the primary CTA and one discovery option are visible without a long scroll.
- Stack hero actions with a full-width primary button; retain the secondary action as a quieter text/button treatment.
- Prefer an inline picker or a single “Choose formats” action over five tall category cards before the core flow.
- Ensure category-card arrows/labels do not depend on hover.

### Tablet
- Avoid the five-card category layout until enough horizontal space is available.
- Preserve clear spacing between CTA controls and avoid two buttons becoming overly wide or wrapping awkwardly.

### Desktop
- Preserve the current large-screen visual rhythm, but reduce the hero’s unused vertical area enough to expose conversion choices sooner.
- Place popular conversions high enough to be found without traversing the whole marketing page.

---

## Accessibility checklist

- [x] Primary navigation uses semantic links.
- [x] Main content has semantic sectioning and descriptive headings.
- [x] Icon-bearing CTAs also include text labels.
- [ ] Add a visible keyboard focus style to every interactive link/card; do not rely solely on browser defaults.
- [ ] Respect `prefers-reduced-motion` for entry animations and hover transforms.
- [ ] Verify text contrast for `text-ink-200` and low-opacity text on each translucent card background.
- [ ] Ensure anchor-target navigation leaves a comfortable offset below the sticky header.
- [ ] If an inline picker is added, provide explicit labels—not placeholder-only inputs.

---

## Prioritized implementation plan

### P0 — next iteration
1. Place a format picker or direct tool-search control in/under the hero.
2. Tighten hero spacing, especially on phones and laptop-height screens.
3. Replace “Universal Coverage” with accurate, registry-backed copy.

### P1
4. Improve category labels, examples, counts, and non-hover affordances.
5. Point “Browse Formats” to the tool directory or rename it to match its anchor behavior.
6. Add reduced-motion and robust focus-visible styles.

### P2
7. Add recent conversions in browser-local storage for returning visitors.
8. Add GitHub/license links if “Open source” remains a footer claim.
9. Consider a lightweight coverage/status page for new or unavailable formats.
