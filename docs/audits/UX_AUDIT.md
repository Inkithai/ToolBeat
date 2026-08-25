# ConvertLab UX & Product Flow Audit

**Scope:** Current public experience: landing page (`/`) and the parameterized conversion page (`/conversion/[type]`) for 13 conversions.  
**Review lens:** Senior product/UX design review of the implemented browser-only conversion product.  
**Date:** 26 July 2026

## Executive summary

ConvertLab has a clean visual foundation and a straightforward core promise: select a file, convert it locally, and download the result. The visual hierarchy is strong on the landing page, and the actual conversion task is intentionally lightweight. The main UX weakness is **information architecture, not visual polish**: the product presents itself as a universal converter but exposes only one direct destination from the primary CTA and most navigation. Users must either infer that the category cards are the tool directory or manually alter a URL to reach most tools.

The conversion screen also uses one generic experience for every format. This keeps implementation simple, but makes the user’s destination, supported input, relevant settings, and next action less obvious than they should be. The UI has no dedicated tool discovery, recent-work flow, conversion history, or purposeful empty/state guidance beyond the uploader. There is no account, checkout, or operator flow in the current product; these should not be invented prematurely, but the architecture should leave room for them.

**Product priority:** Make tool discovery and task completion explicit before adding broader product surface area. A user should be able to reach any converter in one or two intentional clicks, understand its input/output immediately, and recover from every error without starting over.

---

## Current journey and navigation assessment

### What works

- **Clear privacy proposition.** “Everything runs in your browser” is prominent and reinforces a meaningful differentiator.
- **Focused first task.** The converter is a single-screen file → convert → download flow with no forced sign-up or server upload.
- **Recognizable conversion affordances.** Drag/drop, browse, file preview, settings, success confirmation, download, and reset are familiar patterns.
- **Visible feedback.** The selected file, in-progress state, conversion success, and downloadable result are all represented.
- **Basic recovery controls.** “Convert Another” returns the user to the upload state after success.
- **Technical validation is improving.** File-type and format validation prevent several avoidable invalid-conversion paths.

### Structural gaps

1. The homepage’s main “Start Converting” and header “Try Now” both send everyone to **Markdown → PDF**. This conflicts with “universal conversion” and biases an arbitrary tool.
2. Category cards are not categories; each routes to a **single representative conversion**. The labels imply a browseable collection that does not exist.
3. The conversion page title is mechanically generated (for example, `MARKDOWN → PDF`) rather than a human-readable task page with input/output help.
4. All conversions share the same settings panel. Page size and font are irrelevant for data, image, and DOCX conversions, creating cognitive noise.
5. There is no obvious route to switch tools from a conversion page. The only escape is “Back to Home,” followed by a category card that may still not lead to the desired tool.
6. Supported conversions are shown as static, non-clickable labels, despite being the strongest candidate for an in-context tool switcher.
7. The product does not explain output behavior or limitations before action (for example, image transparency in JPG, Markdown-to-DOCX image handling, or client-side size constraints).

---

## Persona review

### 1. New user journey

**Likely goal:** Quickly convert a known file format without understanding the product yet.

**Current path:** Home → “Start Converting” → Markdown-to-PDF page → discover the tool does not match their file → Back to Home → infer a category card → land on a possibly unrelated representative tool.

**Assessment:** Good if the user happens to need Markdown → PDF; poor for every other stated conversion. New users need a format-first starting point, example formats, and immediate reassurance about what is supported.

**Ideal path:** Home → “Choose a conversion” / searchable tool picker → select source and destination → dedicated tool page with accepted formats and one primary upload action → convert → download or convert another.

### 2. Returning user journey

**Likely goal:** Repeat a known conversion with minimal thought.

**Current path:** Revisit the homepage or a bookmarked deep link → upload → convert → download. There is no recent tool shortcut, remembered preferences, or browser-local history.

**Assessment:** Deep links work well, but the homepage gives returning users no accelerated route. This matters for a utility product where repeat usage is a core retention behavior.

**Ideal path:** Home → “Recent conversions” (browser-local, privacy-safe) / “Continue with Markdown → PDF” → upload → convert. Keep last page size/font preference only for relevant PDF tools.

### 3. Power user journey

**Likely goal:** Repeated conversions, fast tool switching, predictable validation, and potentially batch conversion.

**Current path:** One file at a time; return to homepage to change tool; no keyboard-first controls, no tool search, no history, no batch queue, and no output naming control.

**Assessment:** The core engine may support quick single-file conversion, but the product flow is not optimized for high-frequency use. The 50 MB limit is visible only in the uploader and not contextualized by conversion type.

**Ideal path:** Global tool search / command palette → dedicated tool route → multi-file queue where appropriate → per-file status and retry → download all or individual outputs → recent tool shortcut. Batch should be introduced only after conversion quality is proven.

### 4. Admin/operator journey

**Current state:** Not applicable. ConvertLab has no authentication, team workspace, billing, server processing, admin console, or operational dashboard. The current privacy promise explicitly positions processing in the browser.

**Recommendation:** Do not add an admin flow to the public product now. If paid/team features are later introduced, isolate them behind a signed-in workspace and retain a fully functional anonymous local-conversion path. Operator needs would then include conversion error telemetry (aggregated and consented), feature flags, tool availability, support diagnostics, and plan management—not visibility into users’ files.

---

## Findings and recommendations

| # | Current problem | Why it creates friction | Severity | Recommended improvement | Ideal user flow |
|---|---|---|---|---|---|
| 1 | Primary CTAs and “Try Now” always open Markdown → PDF. | Users needing any other format immediately reach the wrong task and must backtrack. It weakens the universal-converter claim. | **High** | Send primary CTA to a `/tools` directory or open a source/destination picker. Use “Convert Markdown to PDF” only in contextual Markdown messaging. | Home → Choose conversion → JSON → YAML → upload JSON. |
| 2 | Category cards route to one tool rather than a category destination. | “Images” implies users can browse image converters, but it routes directly to PNG → JPG. This is a misleading navigation label. | **High** | Create category index pages or a filterable tools directory. Cards should show the count of available tools. | Home → Images (3 tools) → JPG → PNG. |
| 3 | No dedicated tool discovery, search, or filtering. | As the tool count grows, users cannot efficiently find a conversion. Static lists do not scale. | **High** | Add `/tools` with search (“PDF to…”, “CSV”), source/destination filters, category chips, and popular/recent tools. | Tools → type “CSV” → filter Data → choose CSV → Markdown. |
| 4 | Tool switching from the conversion screen is indirect. | A user who selected the wrong tool has to leave the task context and rediscover another tool. | **Medium** | Add a compact “Change conversion” control next to the title, backed by a modal/picker. Make the supported-conversion list clickable. | Markdown → PDF page → Change conversion → Markdown → DOCX. |
| 5 | One generic settings panel shows PDF options for unrelated tools. | Irrelevant options reduce trust and force users to determine whether settings apply. | **High** | Render settings by converter capability. Hide the card entirely when no settings apply; label PDF controls as “PDF layout.” | PNG → JPG → optional Image quality/background settings only. |
| 6 | The tool title is an all-caps transformed slug, with no explanatory metadata. | It is less scannable and provides no quick confirmation of input, output, constraints, or privacy. | **Medium** | Use typed metadata: “Markdown to PDF,” “Convert `.md` files into polished PDFs,” accepted formats, output type, and local-processing note. | Arrive at tool → immediately see `.md → .pdf`, max size, and requirements. |
| 7 | The homepage advertises broad coverage, but conversion availability is not fully surfaced in the navigation. | Users cannot distinguish implemented tools from aspirational categories such as “WebP,” “XML,” and “DOCX” listed in card descriptions. | **High** | Make all marketing copy derive from a single conversion registry. Mark unsupported formats as “Coming soon” only if intentional; otherwise remove them. | User sees Images: PNG → JPG, JPG → PNG, SVG → PNG—no false expectation. |
| 8 | File compatibility is only revealed at selection time. | The corrective error is good, but the user may already have navigated to the wrong tool. | **Medium** | Put accepted input and output chips above the uploader and update the drop-zone copy per tool. | “Upload a `.csv` file” is visible before browse. |
| 9 | The pre-conversion preview is raw text for all text formats and unavailable for DOCX/image output quality. | Users cannot confidently confirm rendering-sensitive inputs before converting. | **Medium** | Offer a formatted Markdown/HTML preview toggle; display an image thumbnail and dimensions; show DOCX metadata/first-page text where feasible. Keep raw source tab for technical users. | Upload Markdown → Source / Rendered tabs → convert. |
| 10 | The PDF renderer’s long-document page breaks may split visual content across page boundaries. | Although text overlap is fixed, raster slicing can still cut a paragraph/table at a page edge, reducing document polish. | **Medium** | Add page-break-aware rendering before future premium claims, or clearly offer an “Auto (single page)” option. Test headings, tables, code, images, and long documents. | Upload long Markdown → A4 pages preserve headings and avoid splitting rows where possible. |
| 11 | Success state only offers a download and reset. | It does not confirm output size, offer quick preview/open, or retain a path to related tasks. | **Low** | Add output filename/size, “Open/Preview” when browser-safe, copy share-safe local status, and a secondary “Convert another file” action. | Convert → success → Download / Preview / Convert another `.md`. |
| 12 | No persistent local recent-tool/history model. | Returning users repeat navigation and cannot recover a completed output after leaving the page. | **Medium** | Store only tool choices and non-sensitive metadata in local storage with explicit “Clear recent activity.” Do not persist file contents or blobs by default. | Return → Recent: CSV → JSON → upload. |
| 13 | No keyboard-first workflow or shortcut education. | Frequent users must use pointer navigation for repeated tasks. | **Low** | Add command palette (`⌘/Ctrl+K`) for tool search and keyboard-accessible uploader/settings; show shortcuts unobtrusively. | `Ctrl+K` → “JSON to CSV” → Enter → select file. |
| 14 | Error feedback appears in the file panel but has no error-specific recovery action. | Users see a message but may not know whether to choose another file, edit the source, or change conversion. | **Medium** | Pair errors with actions: “Choose another file,” “Change conversion,” “View supported format,” or copyable detailed parser error. Preserve selected file when correction is possible. | Invalid CSV → “Unclosed quote on row 4” → Replace file / Change conversion. |
| 15 | No explicit empty, loading, and unsupported-tool route states. | The upload state is good, but unknown routes and unsupported future tools can produce a generic page/error rather than a useful recovery path. | **Medium** | Add a tool-not-found state with directory link; per-tool empty examples; determinate progress where measurable; accessible status announcements. | `/conversion/pdf-to-docx` → “Not available yet” → Browse available tools. |
| 16 | No onboarding beyond marketing content. | First-time visitors may not understand which conversion to choose or what happens to their file, despite the privacy message. | **Low** | Use lightweight contextual onboarding, not a forced tour: “1. Pick tool, 2. Choose file, 3. Download.” Include an optional sample file/demo. | First visit → format picker with a short “How it works” helper. |
| 17 | There is no account, checkout, subscription, or team workflow. | This is not friction today because the product is free/browser-only, but the absence should be explicit in product strategy. | **Low / N/A** | Keep anonymous conversion as the default. If monetization arrives, add value-based limits/features and transparent plan messaging only when needed. | Free local conversion → optional upgrade only for clearly valuable batch/team features. |

---

## State coverage audit

| State | Current coverage | Recommendation |
|---|---|---|
| Initial/empty uploader | Present. | Make content tool-specific; include accepted extension chips and optional sample input. |
| Drag active | Basic browser behavior only. | Add a visible “Drop to upload” state and clear focus treatment. |
| File selected | Present, with name, size, and raw preview for text. | Add file type/dimensions and a replace/remove control before conversion. |
| Loading/converting | Present as an indeterminate spinner. | Use task-specific copy and progress stages when possible (Reading, Rendering, Packaging). Lock duplicate conversion clicks. |
| Success | Present. | Include output metadata, download confirmation, preview where useful, and next conversion suggestion. |
| Validation error | Present. | Add contextual recovery actions and preserve user context. |
| Conversion/parser error | Present. | Surface actionable library/parser details in plain language. |
| Unsupported route/tool | Not explicit. | Build a dedicated not-available state and route to the directory. |
| Network/offline | Implicitly resilient because work is local. | State this in UI; gracefully handle lazy-library loading failure. |
| Accessibility | Basic semantic controls exist. | Add live regions for progress/errors, visible focus states, label uploader input, and test keyboard/screen-reader flow. |

---

## Improved navigation structure

```text
/
├── Home
│   ├── Primary CTA: Choose a conversion → /tools
│   ├── Popular conversions (direct links)
│   ├── Categories (link to filtered directory)
│   └── Recent conversions (browser-local; when available)
│
├── /tools                              # Find a converter
│   ├── Search: “What do you want to convert?”
│   ├── Source format filter
│   ├── Destination format filter
│   ├── Category filters: Documents / Images / Data / Developer / Text
│   ├── Popular
│   └── All tools (human-readable cards)
│
├── /tools/[category]                   # Optional scalable category pages
│   └── Filtered tool list + short category explanation
│
├── /conversion/[type]                  # Dedicated task experience
│   ├── Breadcrumb: Tools > Documents > Markdown to PDF
│   ├── Change conversion picker
│   ├── Tool-specific uploader and requirements
│   ├── Tool-specific preview and settings
│   ├── Convert action
│   ├── Result/download state
│   └── Related conversions
│
├── /help (optional, when content exists)
│   ├── Privacy and local processing
│   ├── Supported formats / limits
│   └── Troubleshooting
│
└── /workspace (future, authenticated only)
    ├── History / batch jobs / team features
    ├── Plan and billing
    └── Account settings
```

### Header recommendation

**Now:** Logo | Categories | How It Works | Try Now  
**Recommended:** Logo | Tools | How it works | Privacy | **Choose a conversion**

On mobile, make “Choose a conversion” the persistent visible action; put informational links in a menu. “Categories” should only remain if it opens actual category browsing.

---

## Recommended end-to-end journey map

### A. First conversion (core acquisition journey)

1. **Entry:** User lands on home from search, referral, or direct visit.
2. **Orientation:** Promise is clear: local, private, free. User sees format-search field and popular tools above the fold.
3. **Tool selection:** User searches/selects source and destination, or browses a real category.
4. **Task confirmation:** Tool page names the task in plain language, states accepted file type, result type, max size, privacy, and relevant settings.
5. **Upload:** User drops/selects a compatible file. The UI acknowledges it and displays a relevant preview/metadata.
6. **Conversion:** One unambiguous primary action. Status communicates what is happening, with no navigation ambiguity.
7. **Completion:** Success validates output, leads with Download, and offers Preview/Convert another/related conversion as secondary options.
8. **Retention:** The selected tool becomes a local recent item; no file content is retained.

### B. Returning utility journey

1. Home or bookmarked tool page.
2. Recent/last-used tool (or direct route) is visible immediately.
3. Upload replacement file.
4. Convert with remembered relevant settings.
5. Download, then optionally repeat without leaving the tool.

### C. Power-user journey

1. Open global tool search via keyboard.
2. Select conversion.
3. Upload one or more supported files (only where output quality and browser limits support batch).
4. See per-file status/retry and download outputs individually or as a ZIP.
5. Keep tool preferences locally; expose clear limits and no hidden server processing.

---

## Prioritized delivery plan

### Phase 1 — Fix discoverability and task clarity (highest impact)

1. Add a real `/tools` directory with human-readable tool cards.
2. Change homepage/header CTAs to tool selection, not Markdown → PDF.
3. Make categories link to filtered tool lists, and align all advertised formats with actual tools.
4. Add tool-specific heading, description, accepted formats, and uploader copy.
5. Replace generic settings with capability-specific settings.
6. Make “Change conversion” and related/supported tools interactive.

### Phase 2 — Improve confidence and recovery

1. Add formatted preview for Markdown/HTML and thumbnails/metadata for images.
2. Add better empty/drag/loading/error/success states and recovery actions.
3. Add unknown-tool/not-available route state.
4. Audit accessibility: keyboard, focus, contrast, screen-reader announcements, and motion preferences.
5. Build a format-specific QA matrix for representative edge cases.

### Phase 3 — Retention and advanced utility

1. Add privacy-safe browser-local recent tools and optional remembered settings.
2. Add command-palette tool search.
3. Evaluate batch conversion based on demand and browser performance.
4. Add a help center only once support content is substantive.
5. Introduce accounts/workspaces/checkout only when there is a clear paid use case; preserve an anonymous local core.

---

## Success metrics

Measure changes without collecting file contents:

- **Tool selection success:** % of visitors reaching a converter matching their first intended input format.
- **Time to first conversion:** landing → download time, segmented by new/returning visitor.
- **Conversion completion rate:** selected file → successful download.
- **Wrong-tool recovery rate:** change-conversion action vs. back/home exits.
- **Validation failure rate:** by tool and error category.
- **Repeat-tool rate:** visitors returning to the same tool within 30 days (local/consented analytics only).
- **Directory search zero-result rate:** identifies missing formats users expect.
- **Accessibility task success:** keyboard-only and screen-reader conversion completion in usability testing.

## Closing product direction

The best premium experience for ConvertLab is not more chrome, accounts, or forced onboarding. It is **radical clarity at the moment of intent**: help a user find the exact conversion, explain the outcome, accept the right file, complete locally, and download confidently. Build the tool directory and converter-specific task pages first; those foundations will make future formats, power-user features, and any business model substantially easier to add without degrading the current simple experience.
