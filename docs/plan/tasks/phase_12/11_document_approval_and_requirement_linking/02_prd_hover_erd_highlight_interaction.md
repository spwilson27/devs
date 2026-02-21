# Task: Implement PRD Hover → TAS ERD Entity Highlight Interaction (Sub-Epic: 11_Document Approval and Requirement Linking)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-092-2]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/__tests__/DocumentDualPane.test.tsx`, write React Testing Library tests for the dual-pane view (`<DocumentDualPane />`):
  - Assert that when the user hovers a `[data-req-id="1_PRD-REQ-UI-018"]` span in the left PRD pane, the right TAS Mermaid ERD pane receives a CSS class `erd-highlighted` on the matching entity node(s).
  - Assert that after mouse-out, the `erd-highlighted` class is removed within one animation frame (use `act` + `jest.runAllTimers`).
  - Assert that hovering a REQ-ID with no TAS mapping does NOT crash and produces no highlight.
  - Assert keyboard focus (Tab + Enter) on a `[data-req-id]` span triggers the same highlight as hover (accessibility).
- [ ] In `packages/webview-ui/src/components/__tests__/MermaidErdHighlighter.test.tsx`:
  - Mock `devs:highlight-erd-entities` event dispatch and assert the `<MermaidErdHighlighter>` wrapper applies SVG `stroke` and `fill` overrides to the correct `<g data-entity-id>` elements.
  - Assert that clearing the event resets all inline styles.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/MermaidErdHighlighter.tsx`:
  - Wraps a rendered Mermaid SVG (passed as `svgRef: RefObject<SVGElement>`).
  - Listens on `window` for `devs:highlight-erd-entities` events; on receipt, adds `data-highlighted="true"` and applies a CSS variable `--erd-highlight-color` override to matching `<g>` elements by `data-entity-id`.
  - Listens for `devs:clear-erd-highlight` and removes all overrides.
  - Uses `useEffect` cleanup to detach listeners on unmount.
- [ ] Update `packages/webview-ui/src/components/DocumentDualPane.tsx`:
  - Left pane: render `<RequirementHighlighter>` (built in task 01).
  - Right pane: render the Mermaid ERD inside `<MermaidErdHighlighter svgRef={erdSvgRef} />`.
  - Ensure both panes are in a CSS Grid layout (`grid-cols-2`) with synchronized scroll disabled (each pane scrolls independently).
- [ ] Add CSS rule in `packages/webview-ui/src/styles/document-pane.css`:
  ```css
  [data-highlighted="true"] {
    stroke: var(--erd-highlight-color, #f59e0b) !important;
    fill-opacity: 0.15 !important;
    transition: stroke 150ms ease, fill-opacity 150ms ease;
  }
  ```
- [ ] Ensure `data-entity-id` attributes are injected during Mermaid post-processing in `packages/webview-ui/src/lib/mermaidRenderer.ts` by walking the rendered SVG DOM and matching `<g class="er entityBox">` nodes to their entity names.

## 3. Code Review
- [ ] Verify that SVG DOM manipulation is isolated inside `MermaidErdHighlighter` and never reaches React's virtual DOM.
- [ ] Confirm `useEffect` dependencies are correct to avoid stale closure bugs when `svgRef.current` changes.
- [ ] Ensure the highlight applies only to the correct SVG elements and does not leak to sibling panes.
- [ ] Confirm the CSS transition does not conflict with the global animation throttler (`ui-risk-004`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="DocumentDualPane|MermaidErdHighlighter"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui run typecheck` to confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add to `packages/webview-ui/AGENT.md` under "Document Dual Pane": describe the highlight event protocol, the `data-entity-id` injection step, and the CSS variable override pattern.
- [ ] Document the keyboard accessibility path (Tab/Enter on REQ-ID spans) in the same section.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --coverage -- --testPathPattern="DocumentDualPane|MermaidErdHighlighter"` and assert branch coverage ≥ 85%.
- [ ] Execute a Playwright E2E smoke test (`pnpm e2e -- --grep "requirement highlight"`) that loads the dual-pane view with fixture PRD/TAS documents, hovers a known REQ-ID, and asserts the ERD entity SVG node has `data-highlighted="true"`. Confirm test exits with code 0.
