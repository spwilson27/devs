# Task: Implement Pan & Zoom Inertia Physics on DAGCanvas (Sub-Epic: 06_DAG Canvas Interactions)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-056], [7_UI_UX_DESIGN-REQ-UI-DES-056-1]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/hooks/__tests__/usePanInertia.test.ts`, write unit tests for the `usePanInertia` hook:
  - Simulate a rapid pan gesture: call the hook's `onPanStart`, `onPanMove` (multiple events with fast velocity), and `onPanEnd` functions via `act()`.
  - Assert that after `onPanEnd`, the hook's returned `velocity` decays toward zero over 400ms using `jest.useFakeTimers()` and `jest.advanceTimersByTime(400)`.
  - Assert that at exactly 400ms after pan end, the `velocity` is within 0.01 of `{x: 0, y: 0}` (i.e., the animation has fully resolved).
  - Assert that at 200ms after pan end (midpoint), the velocity is between 20% and 80% of the initial velocity (exponential decay is non-linear).
  - Test that a very slow pan (velocity < 1px/ms threshold) produces no inertia scroll at all.
- [ ] In `e2e/dag-canvas/pan-inertia.spec.ts`, write an E2E test using Playwright:
  - Simulate a fast mouse drag across the canvas using `page.mouse.move()` sequences at high velocity, then `page.mouse.up()`.
  - Assert that the canvas transform continues to change for at least 100ms after `mouseup` (confirming inertia scroll is active).
  - Assert that the canvas transform stops changing within 500ms of `mouseup` (confirming inertia terminates within the 400ms budget + 100ms margin).

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/hooks/usePanInertia.ts`:
  - Track pointer velocity across a rolling 100ms window using a `pointerHistory: {x, y, t}[]` array updated on each `pointermove`.
  - On `pointerup`, compute `velocity = (lastPos - prevPos) / dt` from the last 2 history entries.
  - If `|velocity| < 1px/ms`, skip inertia.
  - Otherwise, launch a `requestAnimationFrame` loop that applies exponential decay: `velocity *= Math.exp(-INERTIA_DECAY_COEFFICIENT * deltaTime)`, where `INERTIA_DECAY_COEFFICIENT` is tuned so velocity reaches < 1% of initial value in 400ms (`≈ 0.01152`). Document this coefficient in a constant.
  - On each RAF frame, call a provided `onTranslate(dx: number, dy: number)` callback with the incremental pan offset.
  - Stop the RAF loop when `|velocity| < 0.5px/frame`.
  - Export the constant `INERTIA_DURATION_MS = 400` from `packages/webview-ui/src/constants/dag.ts`.
- [ ] In `packages/webview-ui/src/components/dag/DAGCanvas.tsx`:
  - Attach `usePanInertia` hook, providing `onTranslate` as the D3 zoom translate callback:
    ```ts
    onTranslate: (dx, dy) => {
      const currentTransform = d3.zoomTransform(svgRef.current!);
      zoomBehavior.translateBy(d3.select(svgRef.current!), dx, dy);
    }
    ```
  - Ensure D3's built-in drag and the inertia hook do not conflict: disable D3 zoom's native `filter` that might intercept drag-end momentum, and delegate inertia entirely to `usePanInertia`.

## 3. Code Review
- [ ] Verify the inertia loop uses `requestAnimationFrame`, not `setInterval`, to respect the browser's rendering cadence and maintain 60FPS.
- [ ] Confirm the RAF loop is cancelled on component unmount via `useEffect` cleanup (call `cancelAnimationFrame(rafId)` in the cleanup return).
- [ ] Verify `INERTIA_DURATION_MS = 400` and `INERTIA_DECAY_COEFFICIENT` are named constants defined in `packages/webview-ui/src/constants/dag.ts`, not magic numbers inline.
- [ ] Confirm the velocity threshold (< 1px/ms to skip, < 0.5px/frame to stop) is also a named constant.
- [ ] Verify the hook is purely functional and has no direct DOM access; DOM interaction occurs only through the `onTranslate` callback provided by `DAGCanvas`.
- [ ] Confirm the hook handles rapid re-pan (user grabs canvas mid-inertia): verify that `onPanStart` cancels any in-flight RAF loop before starting a new one.

## 4. Run Automated Tests to Verify
- [ ] Run: `pnpm --filter @devs/webview-ui test -- --testPathPattern="usePanInertia"` and confirm all timing assertions pass with fake timers.
- [ ] Run: `pnpm --filter @devs/e2e test -- --grep "pan inertia"` and confirm post-`mouseup` animation and termination timing assertions pass.
- [ ] Run the full dag suite: `pnpm --filter @devs/webview-ui test -- --testPathPattern="dag/"` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/hooks/usePanInertia.agent.md`: Document the hook's API (inputs: `onTranslate` callback; outputs: `onPanStart`, `onPanMove`, `onPanEnd` handlers), the exponential decay formula, the `INERTIA_DECAY_COEFFICIENT` derivation, and the RAF cleanup requirement.
- [ ] Update `packages/webview-ui/src/constants/dag.agent.md` (create if not exists): List and explain all DAG-related constants including `INERTIA_DURATION_MS` and `INERTIA_DECAY_COEFFICIENT`.
- [ ] Update `docs/agent-memory/phase_12.md`: Record the inertia implementation approach (RAF + exponential decay), the coefficient value, and the architectural decision to disable D3 zoom's native momentum in favor of `usePanInertia`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --coverage -- --testPathPattern="usePanInertia"` and assert 100% branch coverage on `usePanInertia.ts` (including the "skip inertia" low-velocity branch and the "cancel mid-inertia" branch).
- [ ] Run `pnpm --filter @devs/e2e test -- --grep "pan inertia" --reporter=junit` and confirm zero `<failure>` elements in the JUnit XML output.
- [ ] Run a browser performance trace: `pnpm --filter @devs/e2e perf-trace -- --scenario "dag-pan-inertia"` and assert the maximum frame time during the inertia deceleration period is below 16.67ms (60FPS target).
