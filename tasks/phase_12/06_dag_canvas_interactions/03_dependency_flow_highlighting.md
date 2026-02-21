# Task: Implement Dependency Flow Highlighting on Node Selection (Sub-Epic: 06_DAG Canvas Interactions)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-055], [7_UI_UX_DESIGN-REQ-UI-DES-055-3]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/dag/__tests__/DAGCanvas.dependencyFlow.test.tsx`, write unit/integration tests that:
  - Render `<DAGCanvas>` with a pre-defined mock DAG: `A → B → C` (A feeds B, B feeds C).
  - Select node `B` by dispatching `setSelectedNodeId('B')` to the Zustand store.
  - Assert that the SVG `<path>` element for edge `A→B` gains the attribute `stroke="var(--devs-primary)"` and the class `dag-edge--highlighted` (which triggers the animated `stroke-dashoffset` CSS animation).
  - Assert that the SVG `<path>` element for edge `B→C` also gains `dag-edge--highlighted`.
  - Assert that edge `A→C` (if it doesn't exist in this mock graph, assert that unrelated edges retain `stroke` value `var(--devs-edge-default)` i.e., grey).
  - Deselect (call `setSelectedNodeId(null)`) and assert all edges revert to grey and the animation class is removed.
- [ ] Write a focused test that verifies the graph traversal utility:
  - In `packages/webview-ui/src/utils/__tests__/dagTraversal.test.ts`, test `getConnectedEdgeIds(graph, nodeId)`:
    - Input: the `A → B → C` graph, nodeId `B`.
    - Expected output: `['edge-A-B', 'edge-B-C']` (both upstream and downstream edges).
    - Input: nodeId `A`. Expected: `['edge-A-B']` (only downstream).
    - Input: nodeId `C`. Expected: `['edge-B-C']` (only upstream).

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/utils/dagTraversal.ts`:
  - Export `getConnectedEdgeIds(graph: DAGGraph, nodeId: string): string[]` that returns the IDs of all edges where `edge.source === nodeId || edge.target === nodeId`.
  - Export `getConnectedNodeIds(graph: DAGGraph, nodeId: string): { upstream: string[], downstream: string[] }` for use in potential future multi-hop highlighting (implement now, use later).
- [ ] In `packages/webview-ui/src/components/dag/DAGEdge.tsx`:
  - Accept prop `isHighlighted: boolean`.
  - When `isHighlighted` is true:
    - Set `stroke` to `var(--devs-primary)`.
    - Add CSS class `dag-edge--flow-animation`.
  - When false: set `stroke` to `var(--devs-edge-default)` (a CSS variable defaulting to `var(--vscode-editorWidget-border)` or equivalent grey).
- [ ] In `packages/webview-ui/src/styles/dag.css`:
  - Define the `dag-edge--flow-animation` keyframe animation:
    ```css
    @keyframes dag-flow {
      from { stroke-dashoffset: 24; }
      to   { stroke-dashoffset: 0; }
    }
    .dag-edge--flow-animation {
      stroke-dasharray: 8 4;
      animation: dag-flow 600ms linear infinite;
    }
    ```
  - Ensure `stroke-dashoffset` animates in the direction that simulates data flowing *toward* the selected node (upstream edges flow inward, downstream edges flow outward). Implement this by conditionally reversing the keyframe using a CSS custom property `--dag-flow-direction: 1 | -1`.
- [ ] In `packages/webview-ui/src/components/dag/DAGCanvas.tsx`:
  - Derive `highlightedEdgeIds: Set<string>` by calling `getConnectedEdgeIds(graph, selectedNodeId)` when `selectedNodeId` is non-null; otherwise an empty Set.
  - Pass `isHighlighted={highlightedEdgeIds.has(edge.id)}` to each `<DAGEdge>`.
  - Pass `--dag-flow-direction` CSS var based on whether the edge is upstream or downstream of the selected node.

## 3. Code Review
- [ ] Verify `getConnectedEdgeIds` is a pure function with no side effects and no React imports; it belongs in `utils/`, not in a component.
- [ ] Confirm the CSS animation (`stroke-dashoffset`) is GPU-composited. `stroke-dashoffset` is NOT composited by default in all browsers—verify that the animation does not degrade FPS. If profiling shows jank, switch to a `transform: translateX()` approach on a `<use>` overlay, not `stroke-dashoffset`, and update tests accordingly.
- [ ] Verify that `highlightedEdgeIds` is derived via `useMemo` inside `DAGCanvas`, so it only recomputes when `selectedNodeId` or `graph` changes.
- [ ] Confirm that all edges default to grey when `selectedNodeId` is `null` (the "no selection" state is a first-class tested case).
- [ ] Review `dagTraversal.ts` for correctness: confirm it handles disconnected graphs (nodes with no edges) without throwing.

## 4. Run Automated Tests to Verify
- [ ] Run: `pnpm --filter @devs/webview-ui test -- --testPathPattern="dagTraversal|DAGCanvas.dependencyFlow"` and confirm all pass.
- [ ] Run the full dag suite: `pnpm --filter @devs/webview-ui test -- --testPathPattern="dag/"` to confirm no regressions.
- [ ] Run E2E smoke test: `pnpm --filter @devs/e2e test -- --grep "dependency flow"` to confirm visual highlighting is visible in the browser.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/utils/dagTraversal.agent.md`: Document `getConnectedEdgeIds` and `getConnectedNodeIds` signatures, expected inputs, and the convention that edge IDs are formatted as `edge-{sourceId}-{targetId}`.
- [ ] Update `packages/webview-ui/src/components/dag/DAGEdge.agent.md`: Document the `isHighlighted` prop, the `dag-edge--flow-animation` CSS class, the `--dag-flow-direction` custom property, and the performance note about `stroke-dashoffset`.
- [ ] Update `docs/agent-memory/phase_12.md`: Record the dependency flow highlighting approach, the pure-utility pattern used for graph traversal, and the CSS animation performance caveat.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --coverage -- --testPathPattern="dagTraversal"` and assert 100% statement coverage on `dagTraversal.ts`.
- [ ] Run `pnpm --filter @devs/e2e test -- --grep "dependency flow" --reporter=junit` and confirm zero `<failure>` elements.
- [ ] Run a Lighthouse performance audit snapshot via `pnpm --filter @devs/e2e lighthouse -- --url=/dag-canvas` and assert the animation FPS does not drop below 55 during edge highlighting transitions.
