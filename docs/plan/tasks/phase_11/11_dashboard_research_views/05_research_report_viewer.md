# Task: Research Market & Competitive Analysis Viewer (Sub-Epic: 11_Dashboard_Research_Views)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-055]

## 1. Initial Test Written
- [ ] Write a unit test for the `ReportViewer` component using React Testing Library to verify that it correctly renders its Markdown content.
- [ ] Write an integration test for the `ResearchView` to ensure that it correctly loads and displays reports from the `useResearchStore` global state.
- [ ] Create a mock of the Zustand `useResearchStore` to verify that the `ResearchView` correctly updates its report content based on state changes.

## 2. Task Implementation
- [ ] Create the `ReportViewer` component in `src/webview/components/Research/ReportViewer.tsx`.
- [ ] Implement the `ReportViewer` utilizing `react-markdown` as per `6_UI_UX_ARCH-REQ-016`.
- [ ] Apply the "Serif" font style for narrative reports as per `7_UI_UX_DESIGN-REQ-UI-DES-031-2` and `7_UI_UX_DESIGN-REQ-UI-DES-015`.
- [ ] Ensure that the `ReportViewer` correctly handles report content formatting (headings, lists, quotes).
- [ ] Implement a "Source Credibility" indicator for each report, linked to the cited sources (1_PRD-REQ-RES-007).
- [ ] Add a "Download Report" button for each Markdown report in the `ResearchView`.

## 3. Code Review
- [ ] Verify that the `ReportViewer` is correctly decoupled from the core orchestrator, using only the Zustand state mirror.
- [ ] Check that no hardcoded colors are used, adhering to `6_UI_UX_ARCH-REQ-004` (Theme-aware styling).
- [ ] Ensure that the component is memoized correctly to prevent unnecessary re-renders when other reports update.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` or the project-specific test runner to execute the new unit and integration tests.
- [ ] Verify that the `ReportViewer` correctly reflects updates to the report content in the mock store.

## 5. Update Documentation
- [ ] Update the `RESEARCH_VIEW.agent.md` documentation to reflect the report viewer implementation.
- [ ] Log the architectural decision for the Research report typography and formatting in the project's decision log.

## 6. Automated Verification
- [ ] Execute a CLI script (e.g., `scripts/verify-report-content.ts`) to programmatically check if the `ReportViewer` correctly displays report content from the `useResearchStore` manifest.
