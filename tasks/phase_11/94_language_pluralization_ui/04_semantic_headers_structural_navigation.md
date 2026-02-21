# Task: Semantic Headers & Structural Navigation in Generated Documents (Sub-Epic: 94_Language_Pluralization_UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-054]

## 1. Initial Test Written
- [ ] In `packages/vscode-webview/src/components/__tests__/`, create `DocumentViewer.a11y.test.tsx`.
- [ ] Render the `DocumentViewer` (or `MarkdownRenderer`) component with a sample multi-section Markdown string containing `#`, `##`, and `###` headers. Using `@testing-library/react`, assert that the rendered DOM contains `<h1>`, `<h2>`, and `<h3>` elements (not `<div class="h1">` or similar non-semantic equivalents).
- [ ] Write a test that renders a PRD document fixture and asserts that `<h1>` appears exactly once (document title), and that all subsequent section headings use `<h2>` or lower — verifying no heading levels are skipped.
- [ ] Write a test using `jest-axe` (`axe(container)`) on the rendered `DocumentViewer` output and assert `violations` is an empty array (no WCAG accessibility violations).
- [ ] Write a test that asserts the `ThoughtStreamer` component's output wraps each thought entry in a `<section>` with an appropriate `aria-label` (e.g., `aria-label="Agent thought at HH:MM:SS"`), enabling screen readers to navigate between thoughts.
- [ ] Write a test that asserts the `SPEC_VIEW` renders spec documents with an auto-generated `<nav aria-label="Document outline">` containing anchor links to each `<h2>` section — verifying the link `href` values match the slugified heading IDs.
- [ ] Write a test that verifies each `<h2>` rendered by `DocumentViewer` has a corresponding `id` attribute (slug-based, e.g., `id="architecture-overview"`) for in-page anchor navigation.

## 2. Task Implementation
- [ ] Audit `packages/vscode-webview/src/components/DocumentViewer.tsx` (or `MarkdownRenderer.tsx`). Ensure the Markdown renderer (`react-markdown`) is configured with `remarkGfm` and that its custom component mapping uses semantic HTML elements:
  - `h1 → <h1>`, `h2 → <h2>`, ..., `h6 → <h6>` — no overrides that replace these with `<div>` or `<span>`.
  - Add `id` attributes to each heading element using a slug derived from the heading text (e.g., via the `github-slugger` package or a simple `text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')` transform).
- [ ] Update `DocumentViewer.tsx` to generate and render a `<nav aria-label="Document outline">` sidebar or header containing an ordered list of anchor links (`<a href="#slug">Section Title</a>`) for each `<h2>` heading in the current document. This outline must update dynamically when the document content changes.
- [ ] In `ThoughtStreamer.tsx`, wrap each individual thought/log entry in a `<section>` element with `aria-label={t('aria.thoughtEntry', { time: formattedTimestamp })}`. Add `aria-label` key `aria.thoughtEntry` to locale files as `"Agent thought at {time}"`.
- [ ] In `SpecView.tsx` (the gated spec review interface), ensure the rendered spec document heading hierarchy is enforced: the document title maps to `<h1>`, top-level sections to `<h2>`, subsections to `<h3>`. If the Markdown source uses deeper heading nesting than the display context warrants, add a `headingDepthOffset` prop to `DocumentViewer` that shifts heading levels (e.g., source `# Foo` renders as `<h2>Foo</h2>` when `headingDepthOffset={1}`).
- [ ] Validate that `react-markdown` does not inject any `role` attribute conflicts — let semantic heading tags carry their implicit ARIA roles.
- [ ] Add the `github-slugger` package (or equivalent) as a dependency in `packages/vscode-webview/package.json` if not already present.
- [ ] Add locale keys to `public/locales/en/translation.json`:
  - `aria.thoughtEntry`: `"Agent thought at {time}"`
  - `aria.documentOutline`: `"Document outline"`
- [ ] Propagate new locale keys to `fr` and `ru` stub locale files.

## 3. Code Review
- [ ] Confirm that NO heading is rendered using a non-semantic element (e.g., `<div className="heading-1">`). Run `grep -rn 'className.*heading' src/components/ src/views/ --include="*.tsx"` and verify results do not represent heading replacements.
- [ ] Verify heading `id` slugs are deterministic and collision-free within a single document (i.e., duplicate heading text gets a `-2`, `-3` suffix from `github-slugger`).
- [ ] Confirm the document outline `<nav>` is placed before the main content in the DOM (or uses `aria-label` to distinguish it from other nav landmarks), enabling screen reader users to jump directly to the outline.
- [ ] Run `axe-core` audit on `DocumentViewer` output in the browser (via Playwright/E2E) and assert zero WCAG AA violations in heading structure.
- [ ] Verify `headingDepthOffset` does not allow heading levels below `<h6>` (clamp at 6) to prevent invalid HTML.
- [ ] Confirm the `ThoughtStreamer` `<section>` elements have unique, time-stamped `aria-label` values — duplicate labels would confuse screen readers.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode-webview test -- --testPathPattern="DocumentViewer.a11y|ThoughtStreamer"` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/vscode-webview test` (full suite) to confirm no regressions.

## 5. Update Documentation
- [ ] In `packages/vscode-webview/AGENT.md`, add a subsection `#### Semantic Document Structure` documenting:
  - The rule that all document rendering MUST use semantic HTML heading elements (`<h1>`–`<h6>`), never presentational heading-like `<div>`s.
  - The `headingDepthOffset` prop and when to use it.
  - The auto-generated document outline `<nav>` and how it is populated.
  - The `<section aria-label>` pattern used in `ThoughtStreamer`.
- [ ] Add a JSDoc comment above the `DocumentViewer` component's heading renderer explaining the slugging strategy and the `headingDepthOffset` prop.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode-webview test -- --coverage --testPathPattern="DocumentViewer"` and assert statement coverage ≥ 90% for `DocumentViewer.tsx`.
- [ ] Run `pnpm --filter @devs/vscode-webview build` and confirm zero TypeScript compilation errors.
- [ ] Execute `grep -rn '<div.*heading\|className="h[1-6]' packages/vscode-webview/src/ --include="*.tsx"` — the result must return 0 matches (no fake heading elements remain).
- [ ] Run `pnpm --filter @devs/vscode-webview lint` and confirm zero accessibility lint violations from `eslint-plugin-jsx-a11y` on `DocumentViewer.tsx` and `ThoughtStreamer.tsx`.
