# Task: Core: High-Frequency Message Batching Engine (Sub-Epic: 04_Event_Streaming_Bridge)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-036]

## 1. Initial Test Written
- [ ] Create a test suite in `@devs/core` (e.g., `src/streaming/batcher.test.ts`) that verifies the `MessageBatcher` logic.
- [ ] Mock a `sender` function that records calls.
- [ ] Verify that sending 100 messages within 10ms results in only ONE call to the `sender` function containing all 100 messages after a 50ms window.
- [ ] Verify that the timer resets correctly after a batch is sent.
- [ ] Test edge cases: empty buffer, buffer with multiple message types, and shutdown behavior (ensuring remaining messages are flushed).

## 2. Task Implementation
- [ ] Implement `MessageBatcher` in `@devs/core/src/streaming/batcher.ts`.
- [ ] Use an internal queue to store outgoing messages (Thought chunks, Logs, State changes).
- [ ] Implement a `setTimeout`-based flush mechanism triggered by the first message in a new window.
- [ ] Ensure the batching interval is exactly 50ms as per `6_UI_UX_ARCH-REQ-036`.
- [ ] The batch envelope should support multiple message types to reduce the number of `postMessage` calls across the VSCode IPC boundary.
- [ ] Expose a `flush()` method to allow manual flushing during critical state transitions (e.g., agent finishing a task).

## 3. Code Review
- [ ] Ensure the `MessageBatcher` is thread-safe or properly handled in the Node.js event loop.
- [ ] Verify that no messages are dropped during the batching process.
- [ ] Check for memory leaks if the buffer grows indefinitely without flushing (e.g., in case of a blocked IPC).
- [ ] Confirm the implementation adheres to the project's Functional Programming patterns where possible (though batchers are inherently stateful).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test @devs/core` and ensure all streaming/batching tests pass.
- [ ] Run a "stress test" script that sends 10,000 small "thought" chunks and validates that the number of IPC calls is significantly reduced.

## 5. Update Documentation
- [ ] Update the internal developer docs for `@devs/core` to explain the high-frequency streaming architecture.
- [ ] Document the batch envelope schema for the benefit of the VSCode extension and Webview consumers.

## 6. Automated Verification
- [ ] Use a script to monitor the number of `postMessage` events in a 1-second window during a simulated high-activity period; verify it stays below 20 events (1000ms / 50ms).
