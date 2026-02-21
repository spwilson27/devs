# Task: Implement Edge Rendering & Update Strategy in edges layer (Sub-Epic: 65_DAG_Layering_Strategy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-045-2]

## 1. Initial Test Written
- [ ] Create unit tests at `webview/src/components/DAGCanvas/__tests__/02_edges_render.test.tsx`:
  - Mount `DAGCanvas` with a mock DAG containing edges and assert `EdgeLayer` renders the correct number of `<path>` elements inside the `edges` layer with `data-edge-id` attributes.
  - Test that updating node positions updates the `d` attribute of existing `<path>` elements without recreating DOM nodes (use `MutationObserver` or spies to assert stable element count).
  - Add a synthetic performance test that renders N=500 edges and measures that the batched update loop finishes within an accepted threshold (use a mocked `requestAnimationFrame` or `performance.now` stubbing).

## 2. Task Implementation
- [ ] Implement `EdgeLayer` at `webview/src/components/DAGCanvas/EdgeLayer.tsx`:
  - Accept props `edges: Edge[]`, `positions: Map<string,{x:number,y:number}>`, `strokeStyle`.
  - Render edges into `<g data-layer="edges">` as `<path data-edge-id={edge.id} d={computePath(edge, positions)} ...>`.
  - Implement an update loop that batches path attribute updates inside `requestAnimationFrame` and, for hot-paths, updates attributes via `element.setAttribute('d', ...)` to avoid full React re-render on every tick.
  - Use stable keys and implement a small DOM pooling mechanism to reuse `<path>` elements when the edge set changes.

## 3. Code Review
- [ ] Verify:
  - Edge updates are batched and executed in `rAF`.
  - Edge updates do not trigger `NodeLayer` re-renders.
  - EdgeLayer logic is isolated, testable, and documented with measured benchmarks.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests and the synthetic performance test; ensure edge updates achieve the expected behavior and performance.

## 5. Update Documentation
- [ ] Update `docs/ui/dag_layering.md` with `EdgeLayer` API, update strategy, and performance guidance.

## 6. Automated Verification
- [ ] Add `scripts/verify-edge-updates.js` that mounts the component headlessly and measures DOM mutation counts and update timings; integrate into CI.
