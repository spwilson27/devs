# Task: Build DiagramAlternativePanel UI Component (Sub-Epic: 96_Diagram_Alt_Text_Contrast)

## Covered Requirements
- [4_USER_FEATURES-REQ-057]

## 1. Initial Test Written
- [ ] In `packages/vscode-webview/src/__tests__/DiagramAlternativePanel.test.tsx`, write React Testing Library tests:
  - Render `<DiagramAlternativePanel diagramDef="graph TD; A-->B" diagramType="flowchart" />` and assert:
    - A tab/button labeled "Diagram" is present and active by default.
    - A tab/button labeled "Text Summary" is present.
    - A tab/button labeled "Table" is present.
  - Click "Text Summary" tab and assert:
    - An ARIA role `region` with `aria-label="Text summary of diagram"` is visible.
    - The prose text returned by `DiagramAlternativeService.generateTextSummary()` (mocked) is rendered inside the region.
  - Click "Table" tab and assert:
    - An ARIA `role="table"` element is present.
    - Column headers matching the flowchart schema (`From`, `To`, `Label`) are rendered in `<th>` elements.
    - Data rows matching the mocked `tableRows` output are rendered in `<td>` elements.
  - Assert the component passes `axe` accessibility audit (using `jest-axe`) in all three tab states.
  - Assert that when `diagramDef` prop changes, the text summary and table are regenerated.

## 2. Task Implementation
- [ ] Create `packages/vscode-webview/src/components/DiagramAlternativePanel/`:
  - `DiagramAlternativePanel.tsx`:
    - Accept props: `diagramDef: string`, `diagramType: DiagramType`, `className?: string`.
    - Maintain local state `activeTab: 'diagram' | 'summary' | 'table'` defaulting to `'diagram'`.
    - Render a `<div role="tablist">` with three `<button role="tab">` elements.
    - Conditionally render:
      - `'diagram'`: a `<MermaidHost diagramDef={diagramDef} />` child (slot the existing component).
      - `'summary'`: a `<section role="region" aria-label="Text summary of diagram">` containing prose from `DiagramAlternativeService.generateTextSummary()`.
      - `'table'`: a `<DiagramTable rows={tableRows} columns={tableColumns} />` sub-component.
    - Use `useMemo` to memoize the `DiagramTextAlternative` result from `DiagramAlternativeService`, recomputing only when `diagramDef` or `diagramType` changes.
  - `DiagramTable.tsx`:
    - Accept props `rows: Record<string, string>[]` and `columns: { key: string; label: string }[]`.
    - Render a `<table>` with `<thead>/<tbody>` using VSCode design tokens for borders and background.
    - Make each row focusable via `tabIndex={0}` for keyboard navigation.
  - `index.ts` — re-export `DiagramAlternativePanel` as the default export.
- [ ] Register `DiagramAlternativePanel` as the wrapper for all `<MermaidHost>` usages in `SPEC_VIEW` and `RESEARCH_VIEW` — replace direct `<MermaidHost>` calls with `<DiagramAlternativePanel>`.
- [ ] Style with Tailwind utility classes and VSCode token CSS variables (`--vscode-tab-activeBackground`, `--vscode-editor-foreground`, etc.) — no hardcoded colors.

## 3. Code Review
- [ ] Confirm all three tabs have correct ARIA attributes: `role="tab"`, `aria-selected`, `aria-controls` pointing to their respective `role="tabpanel"` element IDs.
- [ ] Confirm `DiagramTable` renders a `<caption>` element describing the table purpose for screen readers.
- [ ] Confirm the component never calls `DiagramAlternativeService` during render — must be inside `useMemo` or `useEffect`.
- [ ] Confirm no hardcoded colors — every color must use a `--vscode-*` CSS variable or a Tailwind class that resolves to one.
- [ ] Run `axe` audit programmatically and assert zero violations.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode-webview test -- --testPathPattern=DiagramAlternativePanel` and confirm 0 failures.
- [ ] Run the full webview test suite with `pnpm --filter @devs/vscode-webview test` and confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/vscode-webview/src/components/DiagramAlternativePanel/DiagramAlternativePanel.agent.md` documenting:
  - Component props and their types.
  - Which views use it.
  - ARIA structure diagram (tablist → tabpanel pattern).
- [ ] Update `docs/accessibility.md` to describe the diagram text alternative feature and how to test it with a screen reader.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode-webview test --reporter=json --outputFile=test-results/diagram-alt-panel.json` and assert `"numFailedTests": 0`.
- [ ] Run `pnpm --filter @devs/vscode-webview build` and confirm the Webview bundle compiles without TypeScript or Tailwind errors.
- [ ] Run `node scripts/a11y-audit.mjs --component=DiagramAlternativePanel` (to be created in the same PR, using `axe-core` programmatically against a JSDOM render) and assert exit code 0.
