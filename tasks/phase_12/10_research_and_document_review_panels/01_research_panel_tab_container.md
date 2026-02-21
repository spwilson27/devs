# Task: Research Panel Tab Container (Sub-Epic: 10_Research and Document Review Panels)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-091-1]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/research/__tests__/ResearchPanel.test.tsx`, write unit tests using React Testing Library and Vitest that verify:
  - The `ResearchPanel` component renders four tab labels exactly: "Market Research", "Competitive Analysis", "Technology Landscape", "User Research".
  - Clicking each tab updates `aria-selected` to `true` on the active tab and `false` on all others.
  - The active tab panel's content is visible (not hidden); all other panels use `hidden` attribute or `display: none`.
  - When given no research data, each tab displays a loading skeleton placeholder (`data-testid="tab-skeleton"`).
  - When given populated research data (`ResearchReport` typed prop), the active tab panel renders the report's `summary` field in a `<p>` element.
  - Keyboard navigation: pressing `ArrowRight` from tab 1 moves focus to tab 2; `ArrowLeft` from tab 1 wraps to tab 4 (ARIA `tablist` pattern).
- [ ] Write a snapshot test asserting the default rendered HTML matches the expected tab structure.

## 2. Task Implementation
- [ ] Define the TypeScript interface `ResearchReport` in `packages/webview-ui/src/types/research.ts`:
  ```ts
  export interface ResearchReport {
    id: 'market' | 'competitive' | 'technology' | 'user';
    title: string;
    summary: string;
    sections: ResearchSection[];
    generatedAt: string; // ISO 8601
  }
  export interface ResearchSection {
    heading: string;
    body: string;
    citations: Citation[];
  }
  export interface Citation {
    id: string;
    url: string;
    reliabilityScore: number; // 0.0 – 1.0
    retrievedAt: string;
  }
  ```
- [ ] Create `packages/webview-ui/src/components/research/ResearchPanel.tsx`:
  - Accept prop `reports: ResearchReport[]` and `isLoading: boolean`.
  - Render a `<div role="tablist" aria-label="Research Reports">` containing four `<button role="tab">` elements in order: Market Research, Competitive Analysis, Technology Landscape, User Research.
  - Manage active tab index in `useState`. Default to index 0.
  - Implement keyboard handler (`onKeyDown`) supporting `ArrowLeft`, `ArrowRight`, `Home`, `End` per WAI-ARIA Tabs pattern, using `useRef` array to call `.focus()`.
  - Render four `<div role="tabpanel">` elements; show the active one, hide others via `hidden` attribute.
  - When `isLoading` is true, render `<div data-testid="tab-skeleton" className="skeleton" />` inside each panel instead of content.
  - When a report exists for the active tab, render `<p>{report.summary}</p>` followed by the `<ReportSectionList sections={report.sections} />` sub-component (stub if not yet built).
- [ ] Apply Tailwind CSS classes for the tab strip: active tab uses `border-b-2 border-blue-500 text-blue-600`; inactive tabs use `text-gray-500 hover:text-gray-700`.
- [ ] Export `ResearchPanel` from `packages/webview-ui/src/components/research/index.ts`.
- [ ] Register the panel in the existing webview app router/page so it is reachable at the `#research` route or view state.

## 3. Code Review
- [ ] Verify the component is purely presentational — no data fetching logic inside it; data flows in via props.
- [ ] Confirm `role="tab"`, `aria-selected`, `aria-controls`, `id`, `tabIndex` attributes are all correctly wired per WAI-ARIA 1.2.
- [ ] Ensure no `any` TypeScript types are used; all props are strictly typed.
- [ ] Confirm keyboard navigation does not leak focus outside the tablist.
- [ ] Check Tailwind classes do not rely on JIT purge exemptions; all classes are used in JSX directly (not dynamic string concatenation that would be purged).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter webview-ui test -- --run ResearchPanel` and confirm all tests pass with zero skips.
- [ ] Run `pnpm --filter webview-ui test -- --coverage` and confirm the `ResearchPanel.tsx` file has ≥ 90% line and branch coverage.

## 5. Update Documentation
- [ ] Add a JSDoc comment block to `ResearchPanel.tsx` describing its props, tab order, and ARIA pattern used.
- [ ] Update `packages/webview-ui/README.md` under the "Components" section to list `ResearchPanel` with a one-sentence description.
- [ ] Add an entry to `docs/agent-memory/phase_12_decisions.md` noting: "ResearchPanel uses WAI-ARIA tablist pattern; tab order is fixed as Market, Competitive, Technology, User."

## 6. Automated Verification
- [ ] CI step `pnpm --filter webview-ui test -- --run` must exit 0.
- [ ] Run `pnpm --filter webview-ui tsc --noEmit` and confirm zero TypeScript errors.
- [ ] Verify the snapshot file `ResearchPanel.test.tsx.snap` is committed alongside the test file and matches the current render output by running `pnpm --filter webview-ui test -- --run --reporter=verbose 2>&1 | grep -E "(PASS|FAIL|snapshot)"`.
