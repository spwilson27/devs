# Task: Define DAG Pan/Zoom Architecture and API Contract (Sub-Epic: 67_DAG_Pan_Zoom_Logic)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-023], [7_UI_UX_DESIGN-REQ-UI-DES-110-2]

## 1. Initial Test Written
- [ ] Create unit tests at tests/unit/dag/panzoom/architecture.spec.ts.
  - Use the repository's unit test runner (Jest/Vitest). Import the planned factory: `import {createPanZoomController} from 'src/ui/dag/panzoom/PanZoomController'`.
  - Assert the factory returns an object with the following methods: `getTransform()`, `setTransform({x,y,scale})`, `zoomTo(scale, {x,y})`, `panBy(dx,dy)`, `focusNode(nodeId, options)`, `fitToBounds(bounds)`, `enableMomentum(config)`, `stopMomentum()`.
  - Assert default configuration keys and values exist (minScale, maxScale, initialScale, momentum.enabled, momentum.friction).
  - Assert public methods are pure of side-effects except for returning Promises when animations complete.
  - Run this test first and ensure it fails before implementation.

## 2. Task Implementation
- [ ] Implement a typed controller and API contract at `src/ui/dag/panzoom/PanZoomController.ts`.
  - Export `createPanZoomController(el: HTMLElement, config?: PanZoomConfig): PanZoomAPI` where PanZoomAPI implements the methods listed above and is fully typed (TypeScript).
  - Keep DOM reads/writes isolated to the controller boundary. All coordinate math should live in a separate pure module `src/ui/dag/panzoom/math.ts`.
  - Controller must accept an options object exposing momentum parameters (enabled, friction, threshold), min/max scale, and animation easing/time constants.
  - Expose events or callbacks for `onTransformChange(transform)` and `onFocus(nodeId)` so the DAGCanvas and state store (Zustand) can subscribe.
  - Do not couple the controller to React lifecycle; instead provide a small React hook wrapper `usePanZoomController()` in `src/ui/dag/panzoom/usePanZoomController.tsx` that instantiates and disposes the controller.

## 3. Code Review
- [ ] Verify the public API is minimal and well-typed; internal state is encapsulated.
- [ ] Ensure there is a single source of truth for transform state and that it can be serialized/deserialized (for `vscode.getState`).
- [ ] Confirm no layout thrashing: all heavy calculations happen in pure modules and use requestAnimationFrame for DOM writes.
- [ ] Check for appropriate unit tests and ensure each exported method has at least one positive and one negative test.

## 4. Run Automated Tests to Verify
- [ ] Run the unit tests for this task: `pnpm test -- tests/unit/dag/panzoom/architecture.spec.ts` (or the project's equivalent command).
- [ ] Confirm the created tests now pass.

## 5. Update Documentation
- [ ] Add `docs/ui/dag/panzoom.md` documenting the API contract, configuration options, and recommended integration pattern with the DAGCanvas and Zustand store.
- [ ] Update `tasks/phase_11/67_dag_pan_zoom_logic/README.md` with a summary of the architecture decisions (link to design tokens and UX constraints).

## 6. Automated Verification
- [ ] Add a small verification script `scripts/verify_panzoom_api.js` which imports the built controller module (or uses ts-node) and asserts the presence and types of the exported methods; wire this script into CI for a smoke check.
- [ ] The CI smoke check must fail if any of the listed methods are missing or throw synchronously on instantiation.