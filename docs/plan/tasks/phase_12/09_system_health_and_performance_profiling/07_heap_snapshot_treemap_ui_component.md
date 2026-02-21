# Task: Implement Heap Snapshot Treemap Visualization UI Component (Sub-Epic: 09_System Health and Performance Profiling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-111-2]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/profiling/__tests__/HeapSnapshotTreemap.test.tsx`, write React Testing Library tests:
  - Render `<HeapSnapshotTreemap />` with no data; assert the empty-state message `"No heap snapshot available."` is displayed.
  - Render `<HeapSnapshotTreemap heapSnapshot={mockHeapSnapshotPayload} memoryQuotaBytes={200_000_000} />` with a minimal mock payload (5–10 nodes grouped into 2–3 synthetic modules); assert that a treemap SVG/canvas element is rendered.
  - Assert that each top-level treemap rectangle has a `data-module-name` attribute reflecting the inferred module name.
  - Assert that a module whose allocated bytes exceed its proportional share of `memoryQuotaBytes` (i.e., the module's retention > `memoryQuotaBytes * 0.25` heuristic) has `data-over-quota="true"` on its rectangle.
  - Assert hovering a treemap cell (using `userEvent.hover`) shows a tooltip (`data-testid="treemap-tooltip"`) containing the module name, retained bytes formatted as `"X.X MB"`, and a percentage of total heap.
  - Assert clicking a module cell emits a `onModuleSelect(moduleName: string)` callback prop.
  - Assert the treemap reacts to a new `heapSnapshot` prop by re-rendering the layout (provide two sequential renders; assert rectangle sizes change).
  - Write a snapshot test for the stable 5-module render.

## 2. Task Implementation

- [ ] Install `d3-hierarchy` and `d3-scale` as dependencies: `pnpm --filter @devs/webview-ui add d3-hierarchy d3-scale`.
- [ ] Create `packages/webview-ui/src/components/profiling/transformHeapSnapshot.ts`:
  - Export `transformHeapSnapshotToTreeData(snapshot: HeapSnapshotPayload): TreeNode` where `TreeNode = { name: string, value: number, children?: TreeNode[] }`.
  - Parse the CDP heap snapshot format: iterate `snapshot.nodes` using the `node_fields` schema (each node has `type`, `name`, `self_size`, `retained_size`, etc. encoded in the flat `nodes` array).
  - Group nodes by their inferred module name: extract the module from the `script_name` field if present (e.g., `"node_modules/react/..."` → `"react"`); classify unknown origins as `"(app)"`.
  - Aggregate `retained_size` per module into a hierarchical `TreeNode` structure.
  - Return a root `TreeNode` with children representing top-level modules, each with children for individual allocating scripts.
- [ ] Create `packages/webview-ui/src/components/profiling/HeapSnapshotTreemap.tsx`:
  - Accept props: `heapSnapshot: HeapSnapshotPayload | null`, `memoryQuotaBytes: number`, `onModuleSelect?: (moduleName: string) => void`.
  - When `heapSnapshot` is null, render the empty-state.
  - When provided, call `transformHeapSnapshotToTreeData(heapSnapshot)` and use `d3-hierarchy`'s `d3.treemap()` layout to compute cell positions inside a `<svg ref={svgRef}>`.
  - Color cells using a diverging scale: cells within quota → `var(--vscode-charts-blue)`, cells exceeding the `memoryQuotaBytes * 0.25` heuristic → `var(--vscode-charts-red)`.
  - Set `data-module-name`, `data-over-quota`, and `data-retained-bytes` attributes on each `<rect>` element.
  - On `mouseenter`, render a tooltip portal (`data-testid="treemap-tooltip"`) with module name, retained bytes as `"X.X MB"`, and percentage.
  - On `click`, call `onModuleSelect(moduleName)`.
  - Use `useEffect` with D3 mutations for layout updates; clean up D3 selections on unmount.
  - Add `role="img"` and `aria-label="Heap Snapshot Treemap"` to the root `<svg>`.
- [ ] Subscribe to `system.profiling.heapSnapshotReady` RTES events in the parent panel view and pass the payload to `<HeapSnapshotTreemap>` as a prop.
- [ ] Export `HeapSnapshotTreemap` from `packages/webview-ui/src/components/profiling/index.ts`.

## 3. Code Review

- [ ] Confirm `transformHeapSnapshotToTreeData` is a pure function with no DOM or D3 dependencies, testable in a plain Node.js environment.
- [ ] Confirm D3 selections are scoped to the `svgRef` element and cleaned up in the `useEffect` return function to prevent DOM leaks across hot-reloads.
- [ ] Confirm the over-quota heuristic constant (`0.25` of `memoryQuotaBytes` per module) is extracted into a named constant `QUOTA_PER_MODULE_FRACTION = 0.25` for legibility.
- [ ] Confirm color values use VSCode CSS variables where D3 allows strings; where hex is required, read from `getComputedStyle` at initialization.
- [ ] Confirm the component handles a `heapSnapshot` with zero allocated nodes gracefully (renders empty state, does not crash).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="HeapSnapshotTreemap|transformHeapSnapshot"` and confirm all tests pass.
- [ ] Confirm line/branch coverage ≥ 85% for `HeapSnapshotTreemap.tsx` and `transformHeapSnapshot.ts`.

## 5. Update Documentation

- [ ] Add TSDoc to `HeapSnapshotTreemap` describing all props, and to `transformHeapSnapshotToTreeData` describing the transformation algorithm and module-grouping heuristic.
- [ ] Update `packages/webview-ui/README.md` to document `HeapSnapshotTreemap` under "Profiling & Performance".
- [ ] Update `docs/agent_memory/phase_12_decisions.md`: "`HeapSnapshotTreemap` uses `d3-hierarchy` treemap layout. Heap nodes are grouped by module via `script_name` parsing in `transformHeapSnapshot.ts`. Over-quota heuristic: module retained size > `memoryQuotaBytes * QUOTA_PER_MODULE_FRACTION (0.25)`."

## 6. Automated Verification

- [ ] CI runs `pnpm --filter @devs/webview-ui test -- --ci --testPathPattern="HeapSnapshotTreemap"` and exits code 0.
- [ ] Snapshot `HeapSnapshotTreemap.test.tsx.snap` is committed and current.
- [ ] `pnpm --filter @devs/webview-ui build` succeeds with zero TypeScript errors.
