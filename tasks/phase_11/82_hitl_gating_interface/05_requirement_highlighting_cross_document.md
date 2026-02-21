# Task: Cross-Document Requirement Highlighting in Spec Review (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-092-2]

## 1. Initial Test Written

- [ ] Create `packages/vscode-webview/src/__tests__/RequirementHighlighter.test.tsx`.
- [ ] Write RTL unit tests:
  - Test that hovering over a `RequirementBlock` with `data-req-id="1_PRD-REQ-INT-010"` dispatches a `highlightRequirement` action to the `useHitlGateStore` (or a dedicated `useSpecReviewStore`).
  - Test that when a `highlightedReqId` is set in the store, the Mermaid right-pane `MermaidHost` receives a `highlightedNodeId` prop equal to that `reqId`.
  - Test that `mouseLeave` on the `RequirementBlock` clears `highlightedReqId` (sets to `null`).
  - Test that `MermaidHost` applies the CSS class `erd-node--highlighted` (via a `postMessage` to the Mermaid iframe) when `highlightedNodeId` is set.
  - Test that multiple diagrams in the right pane only highlight the node in the diagram that contains the matching `reqId` — other diagrams remain unhighlighted.
  - Test that the highlight persists while the cursor is within the `RequirementBlock` element boundary (use pointer position simulation).
- [ ] Write an integration test confirming the full hover → highlight → unhighlight cycle renders without errors.

## 2. Task Implementation

- [ ] Extend `packages/ui-hooks/src/stores/specReviewStore.ts` (create new store if not existing):
  - State: `{ highlightedReqId: string | null }`.
  - Actions: `setHighlightedReqId(reqId: string | null)`.
  - Export `useSpecReviewStore`.
- [ ] Update `RequirementBlock.tsx` (from task 04):
  - Add `onMouseEnter` handler: calls `useSpecReviewStore.getState().setHighlightedReqId(reqId)`.
  - Add `onMouseLeave` handler: calls `useSpecReviewStore.getState().setHighlightedReqId(null)`.
  - Add visual feedback: when `highlightedReqId === reqId` (self is highlighted), apply a CSS background tint: `background: color-mix(in srgb, var(--vscode-charts-blue) 10%, transparent)` and increase the left border to `3px`.
- [ ] Update `MermaidHost.tsx` to accept a `highlightedNodeId?: string` prop:
  - When `highlightedNodeId` changes, send a `postMessage` to the Mermaid iframe: `{ type: 'HIGHLIGHT_NODE', nodeId: highlightedNodeId }`.
  - The Mermaid iframe's injected script listens for this message and:
    - Locates the SVG element with `data-id` matching `nodeId` (Mermaid renders ERD nodes with their identifier as `data-id`).
    - Adds the class `erd-node--highlighted` to that element (CSS: `stroke: var(--vscode-charts-blue) !important; stroke-width: 2px; filter: drop-shadow(0 0 4px var(--vscode-charts-blue));`).
    - Removes the class from all other nodes.
    - When `nodeId` is `null`, removes the class from all nodes.
- [ ] Update `GatedSpecReviewView.tsx` to:
  - Subscribe to `useSpecReviewStore` for `highlightedReqId`.
  - Pass `highlightedReqId` as `highlightedNodeId` to each `MermaidHost` instance in the right pane.
- [ ] Add Mermaid iframe injected CSS in `packages/vscode-webview/src/views/GatedSpecReview/mermaidInject.css`:
  ```css
  .erd-node--highlighted {
    stroke: var(--vscode-charts-blue, #2188ff) !important;
    stroke-width: 2px;
    filter: drop-shadow(0 0 4px var(--vscode-charts-blue, #2188ff));
    transition: filter 150ms ease, stroke-width 150ms ease;
  }
  ```

## 3. Code Review

- [ ] Verify the highlight is applied via a Mermaid iframe `postMessage` — no direct DOM manipulation of the Mermaid container from outside the iframe (CSP compliance per [6_UI_UX_ARCH-REQ-012]).
- [ ] Confirm the `specReviewStore` is a separate Zustand slice from the HITL gate store — single responsibility principle.
- [ ] Verify `mouseLeave` clears the highlighted state even when focus moves to the diagram pane (test: rapid hover between source pane items should not leave stale highlights).
- [ ] Confirm the `transition: 150ms ease` on the highlight animation qualifies as functional motion (per [7_UI_UX_DESIGN-REQ-UI-DES-006]) — it must be disabled when `prefers-reduced-motion: reduce` is active. Add `@media (prefers-reduced-motion: reduce) { .erd-node--highlighted { transition: none; } }`.
- [ ] Check that the cross-document requirement ID lookup correctly maps PRD requirement IDs to TAS ERD node identifiers — confirm the `data-id` attribute in Mermaid SVG matches the REQ-ID convention used in `RequirementBlock`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/vscode-webview test -- --testPathPattern="RequirementHighlighter"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/ui-hooks test -- --testPathPattern="specReviewStore"` and confirm all store tests pass.
- [ ] Run both `tsc --noEmit` checks on affected packages.

## 5. Update Documentation

- [ ] Document the hover-highlight protocol in `packages/vscode-webview/src/views/GatedSpecReview/README.md` under a **"Cross-Document Highlighting"** section, including the `postMessage` contract with the Mermaid iframe.
- [ ] Update `docs/agent_memory/phase_11_decisions.md`: "Requirement highlighting uses specReviewStore.highlightedReqId. MermaidHost receives highlightedNodeId prop and forwards it to the iframe via postMessage. Mermaid SVG nodes must have data-id matching the REQ-ID."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/vscode-webview test --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm coverage.
- [ ] Run `grep -r 'HIGHLIGHT_NODE' packages/vscode-webview/src/components/MermaidHost/MermaidHost.tsx` and assert the postMessage type is present.
- [ ] Run `grep -r 'prefers-reduced-motion' packages/vscode-webview/src/views/GatedSpecReview/mermaidInject.css` and assert the media query is present.
