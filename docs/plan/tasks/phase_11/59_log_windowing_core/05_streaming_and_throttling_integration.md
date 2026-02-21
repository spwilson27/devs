# Task: Streaming Ingestion & Throttling Integration (Sub-Epic: 59_Log_Windowing_Core)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-046], [6_UI_UX_ARCH-REQ-094]

## 1. Initial Test Written
- [ ] Create integration tests at tests/webview/console/streaming_integration.test.ts that simulate a high-frequency agent thought stream and assert the windowing/UI pipeline behaves correctly:
  - Use Jest fake timers to simulate 10,000 messages arriving over a short simulated timespan.
  - Assert that WindowingStore length is bounded (<= maxLines) during the stream and after completion.
  - Assert that the ConsoleView receives batched updates (e.g., updates are emitted in batches at <=50ms intervals or a configurable throttle) rather than per-message UI updates.
  - Assert that virtualization remains stable (no layout thrash) and visible DOM nodes do not spike during ingestion.

## 2. Task Implementation
- [ ] Implement a postMessage batching/throttling layer and integrate it with WindowingStore and VirtualizedConsole. Implementation details:
  - src/webview/transport/postMessageBatcher.ts: implement a BatchBuffer that collects incoming log entries and emits batches to subscribers at a configurable interval (default 50ms) or when batch size exceeds a threshold (e.g., 200 items).
  - BatchBuffer API: subscribe(callback:(LogEntry[])=>void), push(entry:LogEntry), flush()
  - Hook BatchBuffer into the Webview transport layer and ensure the WindowingStore.append is invoked from the batch handler.
  - Add configuration knobs for batch interval and batch size for tests.

## 3. Code Review
- [ ] Verify:
  - The batching layer uses setTimeout/setImmediate responsibly and cleans up timers on unmount.
  - Batches merge entries in chronological order and preserve seq monotonicity.
  - No UI update is performed per single message; updates are visibly batched.

## 4. Run Automated Tests to Verify
- [ ] Run the streaming_integration.test.ts with fake timers and confirm assertions about batching and bounded store length pass.

## 5. Update Documentation
- [ ] Update docs/phase_11/59_log_windowing_core/design.md to show the transport buffering strategy, batch interval rationale, and test results demonstrating stability under load.

## 6. Automated Verification
- [ ] Add tests/phase_11/streaming_bench.js that executes the BatchBuffer at production-like rates (e.g., 1k messages/sec simulated) and asserts the UI receive rate stays within target bounds and the store remains bounded.
