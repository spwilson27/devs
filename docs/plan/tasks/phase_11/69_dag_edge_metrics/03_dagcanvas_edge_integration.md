# Task: DAGCanvas integration: apply canonical edge stroke weight in rendering pipeline (Sub-Epic: 69_DAG_Edge_Metrics)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-046-3]

## 1. Initial Test Written
- [ ] Write integration tests (Jest + React Testing Library or a lightweight DOM test) for DAGCanvas that mount the canvas with a small graph (two nodes, one edge) and assert that the rendered edge DOM element has the expected stroke width value when the edge metadata includes thickness: 'thin' and thickness: 'thick'. Name the test file src/components/dag/__tests__/DAGCanvas.edge-integration.test.tsx.

## 2. Task Implementation
- [ ] Update the DAGCanvas rendering pipeline (src/components/dag/DAGCanvas.tsx) to use the Edge component or to set strokeWidth on SVG primitives using the exported mapping helper mapThicknessToPx. Ensure that edges drawn by D3-force or SVG layers receive the numeric strokeWidth attribute. If there is a canvas fallback layer, ensure the canvas stroke width is set accordingly by calling ctx.lineWidth = mapThicknessToPx(...).

## 3. Code Review
- [ ] Verify DAGCanvas uses the shared mapping helper (no duplicated magic numbers), both SVG and Canvas render paths honor the same values, and that there are small unit tests for the canvas path branch (if present) mocking CanvasRenderingContext2D to verify lineWidth was set.

## 4. Run Automated Tests to Verify
- [ ] Run the new integration tests: npx jest src/components/dag/__tests__/DAGCanvas.edge-integration.test.tsx and the entire test suite to ensure no regressions.

## 5. Update Documentation
- [ ] Update docs/ui/dag.md to add a section "Edge stroke weight pipeline" describing how DAGCanvas picks stroke widths for SVG and Canvas renderers and showing example JSON for an edge object that sets thickness.

## 6. Automated Verification
- [ ] Add a CI integration test step that mounts DAGCanvas with a deterministic small graph and asserts the edge stroke widths; fail the pipeline if values deviate from 1 and 2.5 for thin/thick respectively.
