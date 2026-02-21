# Task: Integration tests and lifecycle wiring for Invocation Shimmer (Sub-Epic: 51_Invocation_Shimmer)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-052-1]
- [7_UI_UX_DESIGN-REQ-UI-DES-052-2]
- [7_UI_UX_DESIGN-REQ-UI-DES-052-3]
- [7_UI_UX_DESIGN-REQ-UI-DES-052-4]

## 1. Initial Test Written
- [ ] Create an integration test at `src/components/__tests__/InvocationLifecycle.test.tsx` that mounts a small test harness `InvocationHarness` which manages an invocation lifecycle (states: `idle -> active -> success|failure`). The test should:
  - Render the harness with the `InvocationShimmer` child.
  - Simulate starting an invocation and assert:
    - The `.invocation-shimmer` element is present and uses the gradient token (string contains `linear-gradient(`).
    - The progress sweep element (`data-testid="invocation-progress-sweep"`) becomes visible when active.
  - Simulate a successful completion and assert the `invocation--success` class is applied briefly and the computed style contains `scale(1.02)`.
  - Simulate a failed invocation and assert the `invocation--failure` class is applied and that the failure shake would run (class present and keyframes defined).
  - Use fake timers if necessary to advance animation durations and to assert cleanup of classes after `animationend` events.
  - Confirm the test fails before wiring code.

## 2. Task Implementation
- [ ] Implement `InvocationHarness` inside the test directory or `src/components/test-utils/InvocationHarness.tsx` that exposes methods to start, complete, and fail an invocation for deterministic testing.
- [ ] Wire `InvocationShimmer` to accept lifecycle props or to read lifecycle events from a provided context; prefer props for testability (e.g., `<InvocationShimmer status={status} />`).
- [ ] Ensure `InvocationShimmer` emits `animationend` events (or resolves promises) so the harness can detect when animation cleanup occurs.
- [ ] Keep the wiring minimal and decoupled: the harness should not require the real IPC/orchestrator—use plain React state for tests.

## 3. Code Review
- [ ] Confirm integration tests are deterministic and do not rely on wall-clock timing (use `jest.useFakeTimers()` or equivalent and trigger `fireEvent.animationEnd` for cleanup assertions).
- [ ] Confirm `InvocationShimmer` is decoupled and testable via props/context; avoid reading global singletons in the component.
- [ ] Ensure tests assert behavior (class presence and cleanup) rather than implementation details (avoid asserting internal private functions).

## 4. Run Automated Tests to Verify
- [ ] Run the full test suite and the integration test: `npx jest src/components/__tests__/InvocationLifecycle.test.tsx --runInBand` (or project equivalent). Ensure all assertions pass and tests are stable.

## 5. Update Documentation
- [ ] Add a short developer note in `docs/components.md` describing the lifecycle contract expected by `InvocationShimmer` (props API: `status`, `active`, events: `onAnimationEnd`) so future implementers can wire other UI elements to the same lifecycle.

## 6. Automated Verification
- [ ] `npx jest --json --outputFile=./tmp/invocation-lifecycle.json` and assert `numFailedTests === 0` and `success === true` in the produced JSON. For CI, add the integration test path to the CI test matrix so failures are visible in pipeline logs.
