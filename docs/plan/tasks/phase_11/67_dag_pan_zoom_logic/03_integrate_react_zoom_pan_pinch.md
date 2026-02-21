# Task: Integrate react-zoom-pan-pinch wrapper into DAGCanvas (Sub-Epic: 67_DAG_Pan_Zoom_Logic)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-023], [7_UI_UX_DESIGN-REQ-UI-DES-110-2]

## 1. Initial Test Written
- [ ] Create integration-style tests at `tests/integration/dag/panzoom.integration.spec.tsx` using React Testing Library + user-event (or the project's preferred test stack).
  - Mount a small `DAGCanvas` with 3 nodes and edges inside a test container.
  - Simulate wheel zoom and verify `onTransformChange` is emitted with updated `scale` within expected delta.
  - Simulate mouse drag (pointerdown/move/pointerup) and verify `onTransformChange` shows `x,y` displacement.
  - Assert that programmatic calls to the controller `zoomTo` and `panBy` update the DOM transform attribute or style as expected.

## 2. Task Implementation
- [ ] Add a thin wrapper component `src/ui/dag/panzoom/ReactPanZoomWrapper.tsx` that internally uses `react-zoom-pan-pinch` (or a lightweight controlled implementation if the team prefers no external deps).
  - The wrapper must accept props: `initialTransform`, `minScale`, `maxScale`, `onTransformChange`, `onZoomStart`, `onZoomEnd`, and expose `ref` methods mapped to the PanZoomController API.
  - Integrate the wrapper with `src/ui/dag/DAGCanvas.tsx` replacing any ad-hoc transform code.
  - Ensure the wrapper is server-friendly (guard window usage) and that it integrates with `Shadow DOM` isolation used by the webview.

## 3. Code Review
- [ ] Confirm the wrapper is a minimal surface area: DOM event handling is delegated to the library and only normalized events cross the boundary.
- [ ] Ensure `ref`/controller mapping does not leak internal library objects and the API remains consistent with `PanZoomController` contract.

## 4. Run Automated Tests to Verify
- [ ] Run: `pnpm test -- tests/integration/dag/panzoom.integration.spec.tsx` and validate all simulated user interactions update transforms and emit events.

## 5. Update Documentation
- [ ] Document the wrapper usage and migration steps in `docs/ui/dag/panzoom.md` including the props list and examples of using `usePanZoomController`.

## 6. Automated Verification
- [ ] Add a CI job (or local script) that mounts the `ReactPanZoomWrapper` in a headless browser environment and runs the integration tests; fail if any transform events are not emitted within expected timing windows.