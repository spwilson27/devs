# Task: Keyboard and Accessibility Controls for Diagram Pan/Zoom (Sub-Epic: 67_DAG_Pan_Zoom_Logic)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-024], [7_UI_UX_DESIGN-REQ-UI-DES-110-2]

## 1. Initial Test Written
- [ ] Add accessibility/unit tests at `tests/unit/dag/panzoom/a11y.spec.ts` and interaction tests at `tests/integration/dag/panzoom/keyboard.spec.tsx`:
  - Verify keyboard shortcuts: `+`/`-` or `Ctrl/Cmd +`/`Ctrl/Cmd -` zoom in/out by a step and `0` resets to default transform.
  - Verify arrow keys pan by a small step and `Shift+arrow` pans by a larger step.
  - Verify `Enter` or `Space` on a focused node triggers `focusNode`.
  - Use `jest-axe` (or project's a11y tool) to assert no critical accessibility violations on the DAGCanvas container and that nodes have `role="button"`, `tabIndex=0`, and `aria-label` describing the node.

## 2. Task Implementation
- [ ] Implement keyboard handlers inside `ReactPanZoomWrapper` and expose a `keyboardEnabled` prop (default true):
  - Implement configurable key bindings in a single module `src/ui/dag/panzoom/keyboardBindings.ts` and map to controller methods (`panBy`, `zoomTo`, `focusNode`).
  - Ensure handlers are scoped to the DAGCanvas when it or one of its nodes is focused; do not globalize shortcuts.
  - Add ARIA attributes for nodes and the canvas: `role`, `aria-live` for transform changes if needed, and `aria-describedby` for instructions.
  - Respect `prefers-reduced-motion` by disabling animated pans/zooms and performing instant jumps.

## 3. Code Review
- [ ] Confirm keyboard shortcuts are discoverable and documented in the UI help overlay.
- [ ] Ensure a11y tests are included and that there are no regressions in high-contrast or reduced-motion modes.

## 4. Run Automated Tests to Verify
- [ ] Run unit and integration tests: `pnpm test -- tests/unit/dag/panzoom/a11y.spec.ts tests/integration/dag/panzoom/keyboard.spec.tsx`.

## 5. Update Documentation
- [ ] Add a Keyboard & Accessibility section to `docs/ui/dag/panzoom.md` documenting key bindings, ARIA patterns used, and how to disable animations.

## 6. Automated Verification
- [ ] Add a CI job that runs `jest-axe` against a rendered DAGCanvas and fails the build on critical violations; include keyboard interaction smoke tests in Playwright to ensure shortcuts operate within the canvas scope.