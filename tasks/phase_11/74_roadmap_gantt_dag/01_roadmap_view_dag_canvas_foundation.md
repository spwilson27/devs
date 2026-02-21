# Task: Roadmap View DAG Canvas Foundation (Sub-Epic: 74_Roadmap_Gantt_DAG)

## Covered Requirements
- [4_USER_FEATURES-REQ-033]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/views/RoadmapView/`, create `RoadmapView.test.tsx`.
- [ ] Write a unit test asserting that `<RoadmapView />` renders an SVG element when provided a mock project state with 8 epics and their constituent tasks (each epic with 2–5 tasks).
- [ ] Write a unit test asserting that the component renders exactly N epic-level nodes (one per epic) when passed N epics via props/Zustand store.
- [ ] Write a unit test asserting that clicking an epic node calls an expand handler, toggling the visibility of its child task nodes.
- [ ] Write an integration test using `@testing-library/react` that mounts `<RoadmapView />` with a Zustand provider, verifies the SVG is populated with `g.epic-node` and `g.task-node` elements after expand.
- [ ] Write a snapshot test for the initial (collapsed) render of `<RoadmapView />` with a 12-epic dataset.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/views/RoadmapView/RoadmapView.tsx` as the top-level React component for the Roadmap view.
- [ ] Define TypeScript interfaces `EpicNode` (`{ id, title, status, taskIds: string[] }`) and `TaskNode` (`{ id, title, status, epicId, dependencies: string[] }`) in `packages/vscode/src/webview/views/RoadmapView/types.ts`.
- [ ] Implement a `useDagLayout` custom hook in `packages/vscode/src/webview/views/RoadmapView/useDagLayout.ts` that:
  - Accepts a list of `EpicNode[]` and `TaskNode[]`.
  - Uses `d3-dag` (or `d3-force` with a dagre/sugiyama layout pass) to calculate `x, y` positions for each node.
  - Returns a `{ nodes: LayoutNode[], edges: LayoutEdge[] }` structure.
  - Offloads layout computation to a Web Worker (`dagLayoutWorker.ts`) via `Comlink` to avoid blocking the main thread.
- [ ] Create `packages/vscode/src/webview/views/RoadmapView/dagLayoutWorker.ts` which imports the d3-dag layout logic and exposes a `computeLayout(epics, tasks)` function via Comlink.
- [ ] Implement `<DagCanvas />` sub-component in `DagCanvas.tsx` that renders an SVG with:
  - A `<g class="edges">` layer for dependency edges.
  - A `<g class="nodes">` layer for task/epic nodes.
  - Wrapped in `react-zoom-pan-pinch`'s `<TransformWrapper>` for zoom/pan support.
- [ ] Implement `<EpicNode />` in `EpicNode.tsx`: renders a `<g class="epic-node">` with a label, status badge, and a click handler to toggle expansion. Collapsed state shows only the epic summary rect; expanded state reveals child task nodes positioned within the epic's bounding box.
- [ ] Implement `<TaskNode />` in `TaskNode.tsx`: renders a `<g class="task-node">` as a rounded rect (180×64px per spec) containing the task title, task ID, and a status icon using `@vscode/codicons`.
- [ ] Wire the `<RoadmapView />` to the Zustand Tier-2 project mirror store (`useProjectStore`) to reactively read `epics` and `tasks` data.
- [ ] Register the `RoadmapView` in the `ViewRouter` for the `ROADMAP` route.

## 3. Code Review
- [ ] Verify the layout worker correctly uses `Comlink` and that the main thread never blocks on layout computation (check for no synchronous `d3-dag` calls in the React render path).
- [ ] Confirm all VSCode design tokens (`--vscode-*`) are used for colors; no hardcoded hex values.
- [ ] Confirm `EpicNode` and `TaskNode` use `React.memo` to prevent unnecessary re-renders when unrelated store slices update.
- [ ] Confirm the SVG layers (`edges` below `nodes`) follow the specified Z-ordering to prevent edge lines from rendering over nodes.
- [ ] Confirm the `TransformWrapper` from `react-zoom-pan-pinch` is correctly configured and that its state (zoom/pan position) is stored in Zustand Tier-1 (volatile UI state).
- [ ] Confirm node dimensions match spec: 180px wide × 64px tall, 8px internal padding, 4px border-radius.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="RoadmapView"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode build` to confirm no TypeScript compilation errors are introduced.

## 5. Update Documentation
- [ ] Create `packages/vscode/src/webview/views/RoadmapView/RoadmapView.agent.md` documenting: intent (renders interactive DAG of epics and tasks), hooks consumed (`useProjectStore`), worker dependency (`dagLayoutWorker`), test strategy (unit + integration with mock store).
- [ ] Update `packages/vscode/CHANGELOG.md` with an entry noting the addition of the foundational `RoadmapView` with DAG canvas support.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="RoadmapView"` and assert that line coverage for `RoadmapView.tsx`, `DagCanvas.tsx`, `EpicNode.tsx`, and `TaskNode.tsx` is ≥ 80%.
- [ ] Run `pnpm --filter @devs/vscode type-check` (or `tsc --noEmit`) and confirm zero type errors.
- [ ] Verify the `dagLayoutWorker.ts` file exists at the expected path and is referenced in the Vite/webpack bundle config so it is correctly code-split as a worker entry point.
