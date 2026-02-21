# Task: Implement Focus Interaction and Animated Centering (Sub-Epic: 67_DAG_Pan_Zoom_Logic)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-024]

## 1. Initial Test Written
- [ ] Create integration/unit tests at `tests/integration/dag/panzoom/focus.spec.tsx`:
  - Given a DAG with nodes that have known world coordinates, call `focusNode(nodeId, {padding,scaleHint,animate:true})` and assert the resulting transform centers the node in the viewport within a tolerance of 2 pixels.
  - Assert that focusing emits `onFocus(nodeId)` and that focus state is stored in the global UI store (Zustand) under `ui.dag.focusedNode`.
  - Assert cancelation: calling `focusNode` while an existing focus animation is running should cancel the previous animation cleanly and begin the new one.

## 2. Task Implementation
- [ ] Implement `focusNode` in `PanZoomController` and the React hook wrapper:
  - Compute the node's world-space bounding box from DAG model metadata (avoid DOM reads when possible).
  - Calculate target transform such that the node bounding box is centered in the viewport respecting `minScale`/`maxScale` and `padding`.
  - Implement smooth animation using requestAnimationFrame and an easing function; make duration configurable and cancelable.
  - On focus completion emit an event `onFocusComplete(nodeId)` and update the global store (`ui.dag.focusedNode = nodeId`).
  - Ensure `focusNode` optionally preserves the previous zoom level if `scaleHint` is provided.

## 3. Code Review
- [ ] Ensure no synchronous layout reads in a hot loop: prefer reading node metrics once and using virtual coordinates for animations.
- [ ] Verify focus animations are accessible (respect `prefers-reduced-motion`) and can be disabled via user preference.
- [ ] Confirm adequate unit/integration test coverage for cancellation and edge cases (node off-screen large graph).

## 4. Run Automated Tests to Verify
- [ ] Run integration tests: `pnpm test -- tests/integration/dag/panzoom/focus.spec.tsx` and verify all focus behaviors pass.

## 5. Update Documentation
- [ ] Document `focusNode` API and examples in `docs/ui/dag/panzoom.md` including configuration options and UX notes (e.g., reduced-motion behavior).

## 6. Automated Verification
- [ ] Add an automated script `scripts/verify_focus_behavior.js` that mounts a minimal DAG in Puppeteer/Playwright, calls `focusNode`, and captures a screenshot diff to assert centering accuracy in a CI headless run.