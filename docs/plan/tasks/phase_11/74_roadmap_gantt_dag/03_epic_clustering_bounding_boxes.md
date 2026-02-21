# Task: Epic Clustering — Bounding Boxes in DAG Canvas (Sub-Epic: 74_Roadmap_Gantt_DAG)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-093], [7_UI_UX_DESIGN-REQ-UI-DES-093-1]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/views/RoadmapView/`, create `EpicCluster.test.tsx`.
- [ ] Write a unit test asserting that `<EpicCluster />` renders an SVG `<rect>` element with `class="epic-bounding-box"` enclosing all child task nodes belonging to that epic.
- [ ] Write a unit test asserting that the bounding box rect has `fill` set to a light grey derived from `--vscode-editor-lineHighlightBackground` (or equivalent VSCode token), not a hardcoded color.
- [ ] Write a unit test asserting that the bounding box rect dimensions update reactively when task nodes are added or removed from the epic (i.e., the rect dynamically expands to contain all nodes with at least 12px padding on all sides).
- [ ] Write a unit test asserting that the epic label (text node) appears in the top-left corner of the bounding box.
- [ ] Write an integration test that renders `<DagCanvas />` with two epics and 10 tasks (5 per epic), and confirms that two `rect.epic-bounding-box` elements exist, each containing the correct number of task node elements.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/views/RoadmapView/EpicCluster.tsx`:
  - Accepts `epicId`, `epicTitle`, `taskNodes: LayoutNode[]`, and `padding = 12` as props.
  - Computes the bounding box by finding `minX`, `minY`, `maxX`, `maxY` across all `taskNodes` positions and adding `padding`.
  - Renders:
    - An SVG `<rect>` with `class="epic-bounding-box"`, `rx={4}`, `fill="color-mix(in srgb, var(--vscode-editor-lineHighlightBackground) 60%, transparent)"`, `stroke="var(--vscode-panel-border)"`, `strokeWidth={1}`.
    - An SVG `<text>` for the epic label positioned at `(x + padding, y + padding + 12)` with font-size 11px (Metadata scale), `fill="var(--vscode-descriptionForeground)"`, `fontFamily="var(--vscode-font-family)"`.
- [ ] In `DagCanvas.tsx`, add a `<g class="epic-clusters">` layer rendered *before* the `<g class="edges">` layer and `<g class="nodes">` layer, so bounding boxes appear behind edges and nodes.
- [ ] Compute and pass the per-epic `LayoutNode[]` grouping from the `useDagLayout` hook to each `<EpicCluster />` instance.
- [ ] Ensure the `EpicCluster` recomputes bounding box dimensions whenever the parent `DagCanvas` receives a new layout from the worker (use `useMemo` keyed on `taskNodes`).
- [ ] Apply `pointer-events: none` to the `<rect>` so the bounding box does not intercept click events intended for task nodes behind it.

## 3. Code Review
- [ ] Verify the `<g class="epic-clusters">` layer is the first child of the root SVG `<g>` (i.e., rendered at the lowest Z order, behind edges and nodes).
- [ ] Verify `EpicCluster` uses `useMemo` for bounding box calculation and does not recompute on every parent render.
- [ ] Verify `pointer-events: none` is applied to the bounding box rect to prevent interaction interference.
- [ ] Verify the fill color uses `color-mix()` with a VSCode CSS variable — no hardcoded grey hex values.
- [ ] Verify the epic label text does not overflow the bounding box rect (clip with `clipPath` if necessary for long epic titles).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="EpicCluster"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode build` to confirm no TypeScript or build errors.

## 5. Update Documentation
- [ ] Create `packages/vscode/src/webview/views/RoadmapView/EpicCluster.agent.md` documenting: intent (visual grouping of tasks within epic bounding boxes), props API, rendering order (behind edges/nodes), and the `color-mix()` fill strategy.
- [ ] Update `DagCanvas.agent.md` to document the three-layer SVG structure: clusters → edges → nodes.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="EpicCluster"` and assert line coverage for `EpicCluster.tsx` is ≥ 85%.
- [ ] In the integration test, use `document.querySelectorAll('rect.epic-bounding-box')` and assert the count matches the number of epics in the mock dataset.
- [ ] Confirm via snapshot test that no hardcoded color strings appear in the rendered SVG output (grep the snapshot for hex color patterns).
