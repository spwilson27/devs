# Task: Implement postMessage throttler enforcing 60FPS message rule (Sub-Epic: 45_Performance_Reactivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-006]

## 1. Initial Test Written
- [ ] Add unit tests at tests/unit/utils/postMessageThrottler.test.ts that simulate a high-frequency stream of incoming extension messages and assert that:
  - The throttler flushes batched messages at most once per animation frame (<= 60 FPS, i.e. ~16ms intervals using raf) when configured for RAF mode.
  - Message ordering is preserved across flushes.
  - Backpressure policy applies when queue exceeds maxQueueSize (drop-oldest or drop-newest as specified).
  - Use jest fake timers and a mock requestAnimationFrame implementation to deterministically advance frames.

## 2. Task Implementation
- [ ] Implement the throttler at src/webview/utils/postMessageThrottler.ts with the following API and behavior:
  - export function createPostMessageThrottler(opts: {fps?: number, mode?: 'raf'|'timeout', maxQueueSize?: number, strategy?: 'drop-oldest'|'drop-newest'})
  - Internally buffer incoming messages from the extension host and flush them in a batched array via a single store update or event emitter at the configured rate.
  - Default to mode: 'raf' and fps: 60. Provide fallback to setTimeout if raf not available.
  - Preserve message ordering and attach a monotonic sequence_id to each buffered message to help detect drops.
  - Expose an API to forceFlush() and to gracefully shutdown (remove listeners) for clean unmount.
- [ ] Integrate throttler with webview entrypoint (src/webview/index.tsx): substitute direct message handler with throttler and update downstream code to accept batched messages.

## 3. Code Review
- [ ] Confirm that the flush mechanism does not perform heavy work on the main thread; batching should minimize renders.
- [ ] Ensure event listeners are removed on unmount and the module is memory-leak free.
- [ ] Verify sequence_id monotonicity and proper handling when messages are dropped (emit diagnostics metric).

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- tests/unit/utils/postMessageThrottler.test.ts and a small integration test that simulates extension host bursts and asserts UI update rates remain <= 60 FPS.

## 5. Update Documentation
- [ ] Add section to docs/webview/performance.md describing the throttler, configuration knobs (fps, queue size), and recommended strategies for backpressure.

## 6. Automated Verification
- [ ] Provide a script scripts/simulate-messages.js that streams N messages at MHz to the throttler and records flush timestamps; run in CI with "node scripts/simulate-messages.js" and assert observed flush intervals average >= 16ms.