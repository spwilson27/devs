# Task: Global Animation Throttler with CPU Guard (Sub-Epic: 13_Animation Performance and Guardrails)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-RISK-004], [9_ROADMAP-REQ-036]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/__tests__/performance/`, create `animation-throttler.test.ts`.
- [ ] Write a unit test that constructs `AnimationThrottler` with a mock `CPUUsageProvider` that returns 35% (above the 30% threshold) and asserts that `isThrottled()` returns `true` within one polling interval.
- [ ] Write a unit test that starts with CPU at 20%, verifies `isThrottled()` is `false`, then spikes to 40%, and asserts that a registered animation callback stops being invoked within the next two `rAF` frames.
- [ ] Write a test verifying that when throttled, the `AnimationThrottler` drops animation frames (i.e., registered callbacks are NOT called) rather than queuing them.
- [ ] Write a test verifying that when CPU drops back below 30%, callbacks resume on the next `rAF` cycle without requiring manual re-registration.
- [ ] Write a test using Vitest fake timers that validates the CPU polling interval defaults to 500ms and is configurable.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/performance/CPUUsageProvider.ts`:
  - In a VSCode Webview context, CPU usage cannot be directly obtained from `navigator`. Use the `PerformanceObserver` with `"longtask"` entries as a proxy: if more than 2 long-tasks (>50ms) occur within the last 500ms polling window, report usage as ">30%".
  - Export interface `ICPUUsageProvider` with method `getCPUUsageEstimate(): number` (0–100).
  - Export `LongTaskCPUProxy` implementing `ICPUUsageProvider`.
- [ ] Create `packages/webview-ui/src/performance/AnimationThrottler.ts`:
  - Wraps the existing `AnimationScheduler` (from Task 01).
  - Polls `ICPUUsageProvider.getCPUUsageEstimate()` every 500ms via `setInterval`.
  - Exposes `isThrottled(): boolean`. When `true`, the internal `rAF` loop skips invoking registered callbacks for that frame tick.
  - Exposes `setThreshold(percent: number): void` (default: `30`).
  - Emits a `throttle-state-changed` custom DOM event on the `document` when the throttle state transitions, to allow UI components to show a "Reduced Performance Mode" badge.
- [ ] Register `AnimationThrottler` as a singleton in `packages/webview-ui/src/main.tsx`, replacing the direct `AnimationScheduler` reference so all animation callbacks flow through it.
- [ ] Add a visible "⚡ Perf Mode" indicator chip in `packages/webview-ui/src/components/StatusBar/StatusBar.tsx` that appears when `AnimationThrottler.isThrottled()` is `true`.

## 3. Code Review
- [ ] Confirm `AnimationThrottler.stop()` correctly clears both the `rAF` loop and the CPU polling `setInterval` to prevent memory leaks when the Webview is disposed.
- [ ] Verify that the `LongTaskCPUProxy` gracefully no-ops if `PerformanceObserver` is unavailable (older Webview versions) rather than throwing.
- [ ] Ensure the "Perf Mode" indicator does not itself trigger additional re-renders by using `React.memo` and deriving state from the DOM event rather than polling a React store.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test --reporter=verbose packages/webview-ui/src/__tests__/performance/animation-throttler.test.ts` and confirm all assertions pass.

## 5. Update Documentation
- [ ] Add `AnimationThrottler` and `CPUUsageProvider` to `packages/webview-ui/AGENT.md` under the `## Performance` section, describing the 30% CPU threshold, the `LongTaskCPUProxy` heuristic, and the `throttle-state-changed` event contract.
- [ ] Update `docs/architecture/animation-system.md` to include an architecture diagram showing `AnimationThrottler` wrapping `AnimationScheduler`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test:ci` and verify exit code is `0`.
- [ ] Run the Playwright E2E scenario `throttler-cpu-spike.spec.ts` (create if absent) that injects synthetic long-tasks via `page.evaluate` and asserts the "⚡ Perf Mode" indicator becomes visible within 1 second, exiting non-zero on failure.
