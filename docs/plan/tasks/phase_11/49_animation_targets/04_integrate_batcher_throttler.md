# Task: Integrate Animation Throttler with UI update batching (Sub-Epic: 49_Animation_Targets)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-059-1], [7_UI_UX_DESIGN-REQ-UI-RISK-004]

## 1. Initial Test Written
- [ ] Add an integration test at tests/integration/batcher-throttler.spec.ts that simulates the real postMessage/update path from the extension host into the webview and validates that the throttler is used to schedule DOM updates. The test should:
  - emulate rapid incoming updates (e.g., 200 messages in <100ms) by running window.postMessage calls or by invoking the message handler directly,
  - verify that DOM update callbacks are not applied synchronously but are enqueued into the throttler,
  - verify that FrameMeter average FPS remains >= 55 under nominal load and remains above the stress-threshold configured for the throttler under burst load.

## 2. Task Implementation
- [ ] Modify the webview message handler (the code path that currently applies state updates on message receipt) to enqueue update work into the Animation Throttler instead of performing immediate synchronous DOM updates. Implementation details:
  - find the central postMessage handler in packages/webview/src/host/messageHandler.ts (or the equivalent place); do not change message format, only the scheduling path,
  - replace direct DOM mutation calls with a single small closure that performs the same mutation and call throttler.enqueue(mutationClosure, priority),
  - ensure subscriptions and one-off listeners are still properly removed on unmount, and ensure message processing remains idempotent in the face of retries.

## 3. Code Review
- [ ] Verify message ordering semantics are preserved (no re-ordering unless explicitly allowed by priority), ensure no synchronous blocking occurs in the message handler, and check that throttler metrics are emitted for every batched message.

## 4. Run Automated Tests to Verify
- [ ] Run integration and e2e tests (npx playwright test or npm run test:integration). Confirm that the integration test passes and that the throttler metrics and FrameMeter readings are within acceptable thresholds.

## 5. Update Documentation
- [ ] Update docs/ui/animation.md and docs/architecture.md to explain how the webview message pipeline now enqueues DOM updates to the throttler and how to configure throttler params.

## 6. Automated Verification
- [ ] Add a CI integration step that runs the batcher-throttler integration test and records FrameMeter output to artifacts. The CI step should fail if the throttler is not used (detectable via absence of throttler metrics) or if FPS drops below configured thresholds.