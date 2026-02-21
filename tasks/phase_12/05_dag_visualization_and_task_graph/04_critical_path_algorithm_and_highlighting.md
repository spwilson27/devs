# Task: Critical Path Algorithm and Highlighting Toggle on DAG Canvas (Sub-Epic: 05_DAG Visualization and Task Graph)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-093-2]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/utils/__tests__/criticalPath.test.ts`, write unit tests for `computeCriticalPath(nodes: UITaskNode[], edges: UITaskEdge[]): string[]`:
  - **Linear chain** A→B→C: returns `['A', 'B', 'C']` (all nodes are on the critical path).
  - **Diamond** A→B, A→C, B→D, C→D with uniform weights: returns a path of length 3 (either `[A,B,D]` or `[A,C,D]`).
  - **Single node, no edges**: returns `[nodeId]`.
  - **Empty graph**: returns `[]`.
  - **Graph with a longer branch**: given A→B→D and A→C→D→E, returns `['A','C','D','E']` (longest path).
  - **Cycles** (invalid input, but guard): throws an `Error` with message containing "cycle detected".
- [ ] In `packages/webview-ui/src/components/dag/__tests__/CriticalPathToggle.test.tsx`:
  - Renders a toggle button with `data-testid="critical-path-toggle"` and label "Critical Path".
  - Clicking the toggle when `criticalPath` is empty dispatches `computeCriticalPath` result via `useDagStore.setCriticalPath`.
  - Clicking the toggle when `criticalPath` is non-empty calls `useDagStore.setCriticalPath([])` (clear/off state).
  - The toggle button shows an active/pressed visual state (`aria-pressed="true"`) when `criticalPath.length > 0`.
- [ ] In `packages/webview-ui/src/components/dag/__tests__/DAGCanvas.criticalPath.test.tsx`:
  - When `useDagStore.criticalPath` contains node IDs, the corresponding `DAGTaskNode` elements receive the CSS class `dag-node--critical`.
  - Edges connecting two critical path nodes receive the CSS class `dag-edge--critical`.
  - Non-critical nodes/edges do NOT have those classes.

## 2. Task Implementation

- [ ] Create `packages/webview-ui/src/utils/criticalPath.ts` exporting:
  ```typescript
  export function computeCriticalPath(nodes: UITaskNode[], edges: UITaskEdge[]): string[];
  ```
  - Implement using **topological sort + dynamic programming** (longest path in a DAG):
    1. Build an adjacency list from `edges`.
    2. Compute in-degrees; run Kahn's algorithm for topological ordering. If any node is not reached, throw `Error("cycle detected in task DAG")`.
    3. For each node in topological order, compute `dist[node] = max(dist[predecessor] + 1)`.
    4. Trace back from the node with highest `dist` to reconstruct the path.
  - Time complexity O(V+E), suitable for 200+ node graphs.
- [ ] Create `packages/webview-ui/src/components/dag/CriticalPathToggle.tsx`:
  - A `<button>` component with `data-testid="critical-path-toggle"` and `aria-pressed`.
  - On click: reads `nodes` and `edges` from `useDagStore.getState()`, calls `computeCriticalPath`, dispatches result via `setCriticalPath`. If path is already set, clears it.
  - Uses a codicon icon (`$(git-branch)` or `$(type-hierarchy-sub)`) via `@vscode/codicons`.
  - Styled as a VSCode toolbar icon button (no background, hover: `var(--vscode-toolbar-hoverBackground)`).
- [ ] In `DAGCanvas.tsx`, integrate the critical path visual feedback:
  - Pass `criticalPathSet = new Set(useDagStore(s => s.criticalPath))` down to node/edge renderers.
  - In `DAGTaskNode.tsx`: apply CSS class `dag-node--critical` when `node.id` is in `criticalPathSet`. Style: border `2px solid var(--vscode-charts-yellow)`, `box-shadow: 0 0 0 3px rgba(var(--devs-warning-rgb), 0.25)`.
  - In edge configuration within `DAGCanvas.tsx`: set `className: criticalPathEdgeClass(edge, criticalPathSet)` which returns `dag-edge--critical` if both source and target are in `criticalPathSet`.
  - Add to global CSS: `.dag-edge--critical .react-flow__edge-path { stroke: var(--vscode-charts-yellow); stroke-width: 2.5px; }`.
- [ ] Place `<CriticalPathToggle>` in the DAG toolbar area (sibling to `<DAGCanvas>` in the parent view, e.g., `DAGView.tsx`).

## 3. Code Review

- [ ] Verify `computeCriticalPath` is a **pure function** with no React or store dependencies — it must be independently testable.
- [ ] Confirm cycle detection throws instead of returning a partial result, preventing incorrect highlighting.
- [ ] Verify the critical path is computed on-demand (on button click) and NOT recomputed on every store update, to avoid expensive re-calculation during live task state changes.
- [ ] Confirm `criticalPathSet` is derived with `useMemo` in `DAGCanvas.tsx` so node/edge re-renders only trigger when the `criticalPath` array reference changes.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="criticalPath|CriticalPathToggle"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui tsc --noEmit` with zero errors.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/utils/criticalPath.agent.md` documenting: algorithm choice (topological sort + DP), complexity, cycle detection behavior, and assumptions (uniform node weights — all tasks count equally for path length).
- [ ] Create `packages/webview-ui/src/components/dag/CriticalPathToggle.agent.md` documenting: user interaction model (toggle on/off), store interaction pattern, and the visual CSS classes applied.
- [ ] Update `packages/webview-ui/src/components/dag/DAGCanvas.agent.md` to note critical path CSS class application logic.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test --coverage --testPathPattern="criticalPath"` and confirm 100% branch coverage on `criticalPath.ts` (all algorithm branches: empty, single, linear, diamond, cycle).
- [ ] Load the Extension Development Host with a multi-epic project, click the "Critical Path" toggle, and verify the longest dependency chain is highlighted in yellow with thicker edges. Click again and verify all highlighting is cleared.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm exit code 0.
