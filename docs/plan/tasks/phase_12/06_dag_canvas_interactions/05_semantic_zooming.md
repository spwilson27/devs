# Task: Implement Semantic Zooming on DAGCanvas (Sub-Epic: 06_DAG Canvas Interactions)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-056], [7_UI_UX_DESIGN-REQ-UI-DES-056-2]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/hooks/__tests__/useSemanticZoom.test.ts`, write unit tests for the `useSemanticZoom` hook:
  - Given `zoomLevel = 0.6`, assert the hook returns `zoomTier: 'full'` (task titles and details visible).
  - Given `zoomLevel = 0.35`, assert the hook returns `zoomTier: 'compact'` (task titles hidden, REQ-ID badges shown instead).
  - Given `zoomLevel = 0.05`, assert the hook returns `zoomTier: 'epic'` (individual tasks hidden, only Epic bounding boxes with progress radials rendered).
  - Test the exact boundary values: `0.4` returns `'compact'` and `0.4 + epsilon` returns `'full'`; `0.1` returns `'epic'` and `0.1 + epsilon` returns `'compact'`.
- [ ] In `packages/webview-ui/src/components/dag/__tests__/TaskNode.semanticZoom.test.tsx`, write unit tests:
  - Render `<TaskNode>` with `zoomTier="full"` and assert the task title text is visible in the DOM.
  - Render `<TaskNode>` with `zoomTier="compact"` and assert the task title text is NOT rendered; assert a `<span data-testid="req-id-badge">` containing the REQ-ID is rendered instead.
  - Render `<TaskNode>` with `zoomTier="epic"` and assert the node renders `null` (or `display: none`).
- [ ] In `packages/webview-ui/src/components/dag/__tests__/EpicBoundingBox.test.tsx`, write unit tests:
  - Render `<EpicBoundingBox>` with `zoomTier="epic"` and assert a progress radial SVG element is rendered.
  - Render `<EpicBoundingBox>` with `zoomTier="full"` and assert only the bounding box label is shown (no radial).
- [ ] In `e2e/dag-canvas/semantic-zoom.spec.ts`, write E2E tests:
  - Programmatically set zoom to 0.35 via `page.evaluate(() => window.__dagCanvas.setZoom(0.35))` and assert REQ-ID badges appear and task titles disappear.
  - Set zoom to 0.05 and assert individual nodes are not in the DOM and epic boxes with radials are visible.

## 2. Task Implementation
- [ ] Define zoom tier thresholds as named constants in `packages/webview-ui/src/constants/dag.ts`:
  ```ts
  export const DAG_ZOOM_COMPACT_THRESHOLD = 0.4;  // below this: hide task titles, show REQ-ID badges
  export const DAG_ZOOM_EPIC_THRESHOLD    = 0.1;  // below this: hide tasks, show epic boxes only
  ```
- [ ] Create `packages/webview-ui/src/hooks/useSemanticZoom.ts`:
  - Accept `zoomLevel: number`.
  - Return `zoomTier: 'full' | 'compact' | 'epic'` based on threshold constants.
  - Memoize with `useMemo`.
- [ ] Update `packages/webview-ui/src/components/dag/TaskNode.tsx`:
  - Accept `zoomTier: 'full' | 'compact' | 'epic'` prop.
  - When `zoomTier === 'epic'`: return `null` (do not render).
  - When `zoomTier === 'compact'`: render a minimal node that shows only a `<span data-testid="req-id-badge">{task.reqId}</span>` badge, hiding the full title, description chip, and status icon.
  - When `zoomTier === 'full'`: render the complete node as currently implemented.
- [ ] Create `packages/webview-ui/src/components/dag/EpicBoundingBox.tsx` (if not already existing):
  - Render a rounded SVG rect or `<div>` with the epic label.
  - When `zoomTier === 'epic'`, also render a `<ProgressRadial completedTasks={n} totalTasks={m} />` inline.
  - When `zoomTier !== 'epic'`, render only the bounding box outline and label.
- [ ] In `packages/webview-ui/src/components/dag/DAGCanvas.tsx`:
  - Track the current D3 zoom transform using a `useState<d3.ZoomTransform>`.
  - Update this state in the D3 zoom `on('zoom', ...)` handler: `setCurrentTransform(event.transform)`.
  - Call `useSemanticZoom(currentTransform.k)` to derive `zoomTier`.
  - Pass `zoomTier` down to all `<TaskNode>` and `<EpicBoundingBox>` instances.
  - Expose `window.__dagCanvas = { setZoom: (k) => ... }` in development mode only (for E2E test control).

## 3. Code Review
- [ ] Verify `useSemanticZoom` uses `useMemo` and does not recalculate on every render—only when `zoomLevel` changes.
- [ ] Confirm that returning `null` from `TaskNode` at `'epic'` tier is the chosen pattern (vs `display: none`), and verify this is correct: returning `null` removes nodes from the DOM entirely which saves render cost for large graphs. Confirm the D3 layout positions are still computed for all nodes regardless of render tier.
- [ ] Verify that `DAG_ZOOM_COMPACT_THRESHOLD` and `DAG_ZOOM_EPIC_THRESHOLD` match exactly the requirement values `0.4` and `0.1`.
- [ ] Confirm `window.__dagCanvas` is only attached in development mode (`process.env.NODE_ENV !== 'production'`) to avoid leaking internal APIs in production builds.
- [ ] Check that there is a smooth transition between zoom tiers: confirm that switching from `'compact'` to `'full'` does not cause a jarring layout shift—nodes should re-expand gracefully using a CSS transition on `max-height` or `opacity`.

## 4. Run Automated Tests to Verify
- [ ] Run: `pnpm --filter @devs/webview-ui test -- --testPathPattern="useSemanticZoom|TaskNode.semanticZoom|EpicBoundingBox"` and confirm all pass.
- [ ] Run: `pnpm --filter @devs/e2e test -- --grep "semantic zoom"` and confirm DOM assertions pass at each zoom tier.
- [ ] Run the full dag suite: `pnpm --filter @devs/webview-ui test -- --testPathPattern="dag/"` to confirm no regressions in existing TaskNode tests.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/hooks/useSemanticZoom.agent.md`: Document the hook's input (`zoomLevel: number`), output (`zoomTier`), the threshold constants, and the requirement traceability (`REQ-UI-DES-056-2`).
- [ ] Update `packages/webview-ui/src/components/dag/TaskNode.agent.md`: Document the `zoomTier` prop, the three render modes (`full`, `compact`, `epic`), and the performance rationale for returning `null` at `'epic'` tier.
- [ ] Create `packages/webview-ui/src/components/dag/EpicBoundingBox.agent.md`: Document the component's props, the conditional radial rendering logic, and the zoom tier behavior.
- [ ] Update `docs/agent-memory/phase_12.md`: Record the semantic zoom tier system, threshold constants, and the pattern of returning `null` from `TaskNode` for the `'epic'` tier.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --coverage -- --testPathPattern="useSemanticZoom"` and assert 100% branch coverage (all three zoom tiers and all boundary values tested).
- [ ] Run `pnpm --filter @devs/e2e test -- --grep "semantic zoom" --reporter=junit` and confirm zero `<failure>` elements.
- [ ] Run `pnpm --filter @devs/webview-ui build` and inspect the production bundle: run `grep -r "window.__dagCanvas" dist/` and confirm the dev-only API is absent from the production build output.
