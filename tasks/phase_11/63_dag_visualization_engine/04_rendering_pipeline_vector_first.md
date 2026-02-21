# Task: Implement vector-first rendering pipeline with canvas fallback (Sub-Epic: 63_DAG_Visualization_Engine)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-075], [9_ROADMAP-TAS-704]

## 1. Initial Test Written
- [ ] Add renderer selection tests at tests/components/DAGCanvas/renderer.test.ts:
  - Render DAGCanvas with a small graph (e.g., 10 nodes) and assert an <svg> element is present.
  - Render DAGCanvas with a large graph (e.g., 1000 nodes) and assert a <canvas> element is mounted instead.
  - Test that forcing renderer prop to 'svg' or 'canvas' produces the expected DOM node.

## 2. Task Implementation
- [ ] Implement a renderer abstraction under src/components/DAGCanvas/renderer/:
  - SVGRenderer.tsx: uses SVG groups, preserves crisp vector edges and text.
  - CanvasRenderer.tsx: renders nodes/edges to a high-DPI canvas and supports hit-testing index buffers for interaction.
  - RendererSelector.tsx: chooses SVGRenderer by default and switches to CanvasRenderer when nodeCount > rendererThreshold (configurable, default 300).
- [ ] Ensure devicePixelRatio scaling and crisp lines on high-DPI displays.
- [ ] Expose a prop on DAGCanvas to override renderer selection for testing and debug.

## 3. Code Review
- [ ] Verify coordinate mapping between layout positions and renderer coordinate systems is identical for SVG and canvas renderers.
- [ ] Ensure CanvasRenderer implements an efficient hit-test strategy and avoids per-frame garbage.
- [ ] No visual artifacts when switching renderers at runtime.

## 4. Run Automated Tests to Verify
- [ ] Run tests: npm test -- tests/components/DAGCanvas/renderer.test.ts and expect passing assertions.

## 5. Update Documentation
- [ ] Document the "vector-first" strategy in docs/components/dagcanvas.md including guidance when to prefer canvas and the default threshold.

## 6. Automated Verification
- [ ] CI check: run renderer tests and a small integration that mounts both renderers and asserts identical bounding box extents for the same layout positions.