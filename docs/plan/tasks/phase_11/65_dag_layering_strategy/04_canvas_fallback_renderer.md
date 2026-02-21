# Task: Implement Canvas Fallback Renderer and Runtime Switch for Large DAGs (Sub-Epic: 65_DAG_Layering_Strategy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-045-3]

## 1. Initial Test Written
- [ ] Write integration tests at `webview/src/components/DAGCanvas/__tests__/04_canvas_fallback.test.tsx`:
  - Mount `DAGCanvas` with smallN (e.g., 100) and largeN (e.g., 2000) deterministic datasets and assert:
    - For smallN the SVG renderer is active (`data-testid="dag-canvas-svg"`).
    - For largeN the Canvas renderer is active (`data-testid="dag-canvas-canvas"`) and the SVG DOM is not used as the primary painting surface.
  - Verify visual parity for a fixed seed dataset: the bounding boxes or sampled pixels for core nodes are equivalent within a tolerance between SVG and Canvas renderers (headless pixel-compare test).
  - Test that an explicit user preference can override the automatic switch.

## 2. Task Implementation
- [ ] Implement `CanvasRenderer` at `webview/src/components/DAGCanvas/CanvasRenderer.tsx` and runtime switching in `DAGCanvas`:
  - Provide a unified renderer interface: `renderNodes(nodes, positions)`, `renderEdges(edges, positions)`, and `clear()`.
  - Decide renderer at runtime based on node/edge count, LOD, or explicit override.
  - Canvas implementation details:
    - Use `HTMLCanvasElement` sized for `devicePixelRatio` to remain crisp.
    - Batch draw ops and perform all drawing inside `requestAnimationFrame`.
    - Use simplified shapes for nodes (rects/circles) and throttle label rendering (render only visible/essential labels).
    - Maintain a spatial index (quadtree/rbush) for hit-testing.
    - Expose a transparent overlay DOM layer for pointer events; translate overlay coordinates into canvas coordinates to resolve node ids.
  - Provide a configuration flag `canvasFallbackThreshold` and a user override setting.

## 3. Code Review
- [ ] Verify:
  - Canvas renderer respects `devicePixelRatio` scaling and properly frees resources.
  - Spatial index is used for hit-testing and coordinate transforms are correct for pan/zoom/scale.
  - Canvas fallback preserves core visual semantics and accessibility via overlay and ARIA live summaries.

## 4. Run Automated Tests to Verify
- [ ] Run integration tests and a headless comparison harness (Puppeteer or headless canvas) that compares SVG and Canvas outputs for a deterministic sample.

## 5. Update Documentation
- [ ] Update `docs/ui/dag_layering.md` to document CanvasRenderer design, switching heuristic, and configuration flags.

## 6. Automated Verification
- [ ] Add `scripts/verify-canvas-fallback.js` that builds the webview bundle and uses Puppeteer or headless-canvas to assert renderer selection and visual parity for a tuned dataset.
