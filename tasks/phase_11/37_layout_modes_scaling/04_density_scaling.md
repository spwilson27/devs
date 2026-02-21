# Task: Implement Density Scaling and Virtualization for >100 tasks (Sub-Epic: 37_Layout_Modes_Scaling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-049-3]

## 1. Initial Test Written
- [ ] Add unit tests in `packages/ui/src/__tests__/density.spec.ts`:
  - Implement and test `evaluateDensityMode(count)` with constant `HIGH_DENSITY_THRESHOLD = 100`: expect `normal` for `count <= 100` and `high` for `count > 100`.
  - Mock `DAGCanvas` and assert when `evaluateDensityMode(150) === 'high'` the canvas renderer is selected and virtualization API (`renderVisibleNodes`) is invoked (spy/stub).
  - Integration: Render `DAGCanvas` with 150 mock nodes in a headless browser and assert DOM node count is bounded (e.g., < 300), and that scrolling updates visible nodes window.

## 2. Task Implementation
- [ ] Implement density-scaling in `packages/ui/src/layout/density.ts` and update `DAGCanvas`:
  - Export `evaluateDensityMode(count:number): 'normal' | 'high'` and constants `HIGH_DENSITY_THRESHOLD = 100`.
  - Map density mode to LOD settings: node size, label truncation, spacing, and collision radius; document mapping in comments.
  - Implement a `CanvasRenderer` fallback in `DAGCanvas` that uses `<canvas>` drawing path for high-density mode to improve performance and reduce DOM node count.
  - Offload heavy layout calcs to a Web Worker `packages/ui/src/workers/forceLayout.worker.ts` using d3-force; worker receives minimal node data (id, weight) and returns positions.
  - Implement virtualization/windowing strategy (e.g., index-based window) so DOM nodes are created only for visible range; add a configuration parameter `visibleWindowSize` defaulting to 200.
  - Emit a telemetry event `density_mode_changed` when mode toggles, including taskCount and selectedRenderer.

## 3. Code Review
- [ ] Ensure:
  - Worker messages are small and structuredClone-safe; use transferable objects where applicable.
  - Worker lifecycle (create/terminate) handled on mount/unmount and on mode transitions.
  - Memory usage scales with visible nodes only; ensure no leaks by checking handles to large arrays are released.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests and run an integration scenario in Playwright/Puppeteer to mount `DAGCanvas` with 150 nodes; assert web worker messages were posted and that DOM node count stays under the configured `visibleWindowSize`.

## 5. Update Documentation
- [ ] Add `docs/ui/density-scaling.md` describing the threshold, LOD mapping, the canvas fallback rationale, worker API contract, and the telemetry event format.

## 6. Automated Verification
- [ ] CI helper script `tests/ci_density_check.js` should render a minimal page with 150 nodes, measure DOM node count via Playwright, and fail CI if the count exceeds 300 or if no worker messages were observed.