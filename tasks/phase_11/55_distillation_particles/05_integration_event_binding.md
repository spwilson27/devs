# Task: Integration — Hook DistillationSweep to UI event stream and emit lifecycle events (Sub-Epic: 55_Distillation_Particles)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-057-1]

## 1. Initial Test Written
- [ ] Write an integration test tests/ui/distillation/integration.test.ts that mocks the project's UI event bus (or Zustand action dispatcher) and asserts that when a 'distill' event is emitted with {origin,target,density?} the DistillationSweep component is mounted/activated with correct props and that it emits a 'distillation:complete' event when finished. Use fake timers to fast-forward sweepDuration.

## 2. Task Implementation
- [ ] Implement an adaptor at src/ui/distillation/integration.ts that subscribes to the UI event stream (export bindDistillationToBus(bus) or similar) and listens for 'distill' events. On event, call startDistillation(origin,target,opts) which mounts/activates DistillationSweep and dispatches lifecycle events: 'distillation:start', optional 'distillation:frame', and 'distillation:complete'. Ensure the adaptor is small and testable and does not assume DOM details.

## 3. Code Review
- [ ] Ensure the integration is decoupled (event adapter only), uses typed payloads, exposes an unsubscribe cleanup, and honors theme tokens and reduced-motion settings. Confirm integration can be mocked in tests and has no hidden side effects.

## 4. Run Automated Tests to Verify
- [ ] Run the integration tests and confirm they pass; assert event ordering and correct payloads for start/complete events.

## 5. Update Documentation
- [ ] Document the event API in docs/ui/distillation.md including sample binding code and recommended lifecycle usage (e.g., trigger after a thought is summarized).

## 6. Automated Verification
- [ ] Add a test harness script tests/scripts/verify-distillation-integration.js that simulates the bus, runs a short distillation cycle, and asserts the correct event sequence; wire this into local CI smoke checks if appropriate.
