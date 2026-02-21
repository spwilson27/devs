# Task: FPS Performance Benchmarking Infrastructure (Sub-Epic: 13_Animation Performance and Guardrails)

## Covered Requirements
- [9_ROADMAP-REQ-036], [7_UI_UX_DESIGN-REQ-UI-DES-059], [7_UI_UX_DESIGN-REQ-UI-DES-059-1]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/__tests__/performance/`, create `fps-benchmark.test.ts`.
- [ ] Write a Vitest test suite that mounts the `AgentConsole` component with a `react-test-renderer` and uses `performance.now()` to measure frame render times over 300 consecutive React state updates simulating rapid Gemini Flash token streaming.
- [ ] Assert that the 95th-percentile render interval is ≤ 16.67ms (1000ms / 60FPS).
- [ ] Write a separate test that stubs `requestAnimationFrame` using Vitest fake timers and verifies the animation loop in `AnimationScheduler` completes each frame callback within 16ms.
- [ ] Write an integration test that uses Playwright's `page.metrics()` to record `Frames` and `FrameTime` during a 5-second simulated streaming session against the Webview harness, asserting `FramesPerSecond >= 60`.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/performance/FPSMonitor.ts`:
  - Export a singleton class `FPSMonitor` with methods `start()`, `stop()`, and `getStats(): { avgFPS: number; p95FrameTime: number; droppedFrames: number }`.
  - Use a `requestAnimationFrame` loop to record frame timestamps in a circular buffer of the last 120 samples.
  - Expose a `onDrop` callback that fires when a frame exceeds 16.67ms.
- [ ] Create `packages/webview-ui/src/performance/AnimationScheduler.ts`:
  - Export a class `AnimationScheduler` that queues animation callbacks and dispatches them inside a single `rAF` loop per frame, preventing multiple competing `requestAnimationFrame` calls from different components.
  - Expose `schedule(id: string, callback: FrameRequestCallback): void` and `cancel(id: string): void`.
- [ ] Update `packages/webview-ui/src/main.tsx` to instantiate `FPSMonitor` and `AnimationScheduler` at app bootstrap, attaching them to a `window.__devs_perf` object for E2E test introspection.
- [ ] Ensure all existing animation-producing components (`ReasoningPulse`, `InvocationShimmer`, `DAGCanvas`) register their frame callbacks via `AnimationScheduler.schedule()` instead of calling `requestAnimationFrame` directly.

## 3. Code Review
- [ ] Verify that `FPSMonitor` uses a fixed-size circular buffer (no unbounded array growth) to prevent memory leaks during long-running sessions.
- [ ] Confirm `AnimationScheduler` correctly deduplicates callbacks by `id` so that hot-path re-renders do not double-register the same animation.
- [ ] Ensure no `setInterval` is used for frame timing—only `requestAnimationFrame`.
- [ ] Check that `window.__devs_perf` is gated behind `process.env.NODE_ENV !== 'production'` to avoid leaking internals in production builds.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test --reporter=verbose packages/webview-ui/src/__tests__/performance/fps-benchmark.test.ts` and confirm all assertions pass.
- [ ] Run `pnpm --filter @devs/webview-ui test:e2e --grep "FPS"` and confirm Playwright frame-rate assertions pass.

## 5. Update Documentation
- [ ] Add a `## Performance` section to `packages/webview-ui/AGENT.md` documenting `FPSMonitor` and `AnimationScheduler` APIs, the 60FPS SLA, and the `window.__devs_perf` introspection interface.
- [ ] Update `docs/architecture/animation-system.md` (create if absent) with a diagram showing the single `rAF` loop architecture.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test:ci` and verify exit code is `0`.
- [ ] Run `node scripts/validate-perf-budget.js` (create this script if absent) which reads the Playwright trace JSON and asserts `p95FrameTime < 16.67` and `droppedFrames < 5` for the 300-update streaming scenario, exiting non-zero on failure.
