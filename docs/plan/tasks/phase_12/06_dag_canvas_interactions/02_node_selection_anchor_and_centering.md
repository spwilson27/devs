# Task: Implement Node Selection Anchor & Viewport Centering on DAGCanvas (Sub-Epic: 06_DAG Canvas Interactions)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-055], [7_UI_UX_DESIGN-REQ-UI-DES-055-2]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/dag/__tests__/TaskNode.selection.test.tsx`, write unit tests that:
  - Render `<DAGCanvas>` with a mocked graph of 3 nodes and a Zustand store.
  - Simulate `userEvent.click()` on a node identified by `data-testid="dag-node-{taskId}"`.
  - Assert that the clicked node's root element gains the CSS class `dag-node--selected` (border: `3px solid var(--devs-primary)`).
  - Assert that the global Zustand store slice `dag.selectedNodeId` is updated to the clicked task's ID.
  - Click a second node; assert the first node loses the `dag-node--selected` class and the second node gains it (only one node selected at a time).
- [ ] In `packages/webview-ui/src/components/dag/__tests__/DAGCanvas.centering.test.tsx`, write an integration test that:
  - Mocks the `d3-zoom` `transition().duration(500).call(zoom.translateTo(...))` call.
  - Asserts that clicking a node triggers the mock `d3-zoom` centering transition with `duration(500)`.
  - Asserts that `zoom.translateTo` is called with the correct (x, y) coordinates of the target node.
- [ ] In `e2e/dag-canvas/node-selection.spec.ts`, write an E2E test that:
  - Clicks a node and asserts `border: 3px solid` is visible via computed style.
  - Waits 600ms and then asserts the node is within the visible viewport bounding box.

## 2. Task Implementation
- [ ] In `packages/webview-ui/src/store/dagSlice.ts` (Zustand slice):
  - Add `selectedNodeId: string | null` to the store state, defaulting to `null`.
  - Add `setSelectedNodeId(id: string | null): void` action.
- [ ] In `packages/webview-ui/src/components/dag/TaskNode.tsx`:
  - Accept a prop `isSelected: boolean` from the parent `DAGCanvas`.
  - Apply border styles conditionally: when `isSelected`, apply `outline: 3px solid var(--devs-primary)` (use `outline` rather than `border` to avoid layout shift). Add via inline style or a CSS variable-aware Tailwind arbitrary value class.
  - On `onClick`, call `setSelectedNodeId(task.id)` via the Zustand store hook.
- [ ] In `packages/webview-ui/src/components/dag/DAGCanvas.tsx`:
  - Subscribe to `dag.selectedNodeId` from the Zustand store.
  - When `selectedNodeId` changes (via `useEffect`), look up the node's `(x, y)` position from the D3 layout and call:
    ```ts
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(zoomBehavior.translateTo, nodeX, nodeY);
    ```
  - Pass `isSelected={selectedNodeId === task.id}` to each `<TaskNode>`.

## 3. Code Review
- [ ] Confirm that `outline` is used for the selection border (not `border`), so the selection indicator does not alter the node's layout dimensions and avoids reflow.
- [ ] Verify that only ONE node can be selected at a time (single-select). The Zustand slice must store a single `string | null`, not an array.
- [ ] Confirm the `d3-zoom` transition duration is exactly `500ms` as specified by the requirement. Hardcode this as a named constant `DAG_SELECTION_CENTER_DURATION_MS = 500` in `packages/webview-ui/src/constants/dag.ts`.
- [ ] Verify that `setSelectedNodeId` is called on the synthetic React `onClick` event, NOT on a `mousedown` or `pointerdown` event, to avoid conflict with pan-drag gesture detection.
- [ ] Ensure `useEffect` dependency array for the centering transition includes `[selectedNodeId]` and cleans up any in-flight D3 transitions on re-selection.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: `pnpm --filter @devs/webview-ui test -- --testPathPattern="TaskNode.selection|DAGCanvas.centering"` and confirm all pass.
- [ ] Run E2E tests: `pnpm --filter @devs/e2e test -- --grep "node selection"` and confirm all pass.
- [ ] Run the full dag suite: `pnpm --filter @devs/webview-ui test -- --testPathPattern="dag/"` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `packages/webview-ui/src/components/dag/DAGCanvas.agent.md`: Document the selection mechanism, the Zustand slice field `selectedNodeId`, the `d3-zoom` centering pattern, and the `DAG_SELECTION_CENTER_DURATION_MS` constant location.
- [ ] Update `packages/webview-ui/src/store/dagSlice.agent.md`: Record the `selectedNodeId` field and `setSelectedNodeId` action and their invariants (single-select, nullable).
- [ ] Update `docs/agent-memory/phase_12.md`: Record that node selection uses Zustand global state (unlike hover which is local), and that centering is triggered reactively via `useEffect` on `selectedNodeId`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --coverage -- --testPathPattern="dag/"` and verify `dagSlice.ts` has >= 90% branch coverage (both `null` and `string` cases for `selectedNodeId`).
- [ ] Run `pnpm --filter @devs/e2e test -- --grep "node selection" --reporter=junit` and confirm zero `<failure>` elements in the JUnit XML output.
- [ ] Manually inspect the D3 transition mock call log in the unit test output to confirm `duration(500)` appears exactly once per click event.
