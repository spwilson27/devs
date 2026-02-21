# Task: Implement Thought Batching Buffer for SAOP Stream (Sub-Epic: 02_Trace Streaming and Agent Console Core)

## Covered Requirements
- [TAS-058], [3_MCP-TAS-038]

## 1. Initial Test Written

- [ ] In `packages/orchestrator/src/streaming/__tests__/thought-batching-buffer.test.ts`, write unit tests for the `ThoughtBatchingBuffer` class:
  - Test that when 50 `ThoughtEnvelope` events are pushed within a 16ms window, `flush()` is called exactly once and the flushed batch contains all 50 events in sequenceNumber order.
  - Test that when events are pushed continuously at a rate exceeding the flush interval, the buffer does not accumulate unboundedly: after 10,000 pushes, the in-memory queue length never exceeds a configurable `maxBufferSize` (default 500).
  - Test that when `maxBufferSize` is exceeded, the oldest events are dropped (head-drop strategy) and a `"buffer_overflow"` event is emitted by the buffer's `EventEmitter`.
  - Test that `ThoughtBatchingBuffer.stop()` flushes any remaining events in the queue before resolving.
  - Test that the `onFlush` callback receives a `ThoughtEnvelope[]` array (never a mix of Action or Observation envelopes, which should be passed through un-buffered).
  - Test that `ActionEnvelope` and `ObservationEnvelope` events pushed into the buffer are emitted immediately (bypassing the batch window) by checking they arrive within 2ms.

## 2. Task Implementation

- [ ] Create `packages/orchestrator/src/streaming/thought-batching-buffer.ts`.
- [ ] Import `SAOPEnvelope`, `ThoughtEnvelope` from `@devs/core`.
- [ ] Implement class `ThoughtBatchingBuffer extends EventEmitter` with:
  - `constructor(options: { flushIntervalMs?: number; maxBufferSize?: number; onFlush: (batch: ThoughtEnvelope[]) => void; onPassthrough: (envelope: SAOPEnvelope) => void })`.
  - Default `flushIntervalMs: 16` (one animation frame at 60FPS).
  - Default `maxBufferSize: 500`.
  - Private `queue: ThoughtEnvelope[] = []`.
  - Private `timer: NodeJS.Timer | null`.
  - `push(envelope: SAOPEnvelope): void`:
    - If `envelope.type === "thought"`: append to `queue`; if `queue.length > maxBufferSize`, splice from the front until within limit and emit `"buffer_overflow"` event.
    - If `envelope.type === "action"` or `"observation"`: call `onPassthrough(envelope)` immediately.
  - `start(): void` - sets up `setInterval(this.flush.bind(this), flushIntervalMs)`.
  - `flush(): void` - if queue is non-empty, calls `onFlush(this.queue.splice(0))` (atomic drain).
  - `stop(): Promise<void>` - clears interval, calls `flush()` once, resolves immediately after.
- [ ] Wire the `ThoughtBatchingBuffer` between the LLM streaming output and the `SaopStreamingServer.emit()` call inside the orchestrator's agent execution loop in `packages/orchestrator/src/agents/agent-runner.ts`.
  - The `onFlush` callback should call `SaopStreamingServer.emit()` for each envelope in the batch (iterate the array).
  - The `onPassthrough` callback should call `SaopStreamingServer.emit()` directly.

## 3. Code Review

- [ ] Verify that `flush()` uses `this.queue.splice(0)` (atomic drain) rather than iterating and shifting, to prevent race conditions where new items arrive mid-flush in async contexts.
- [ ] Confirm that `"buffer_overflow"` events emitted by the `EventEmitter` are logged as `WARN` level by the orchestrator's logger, and that this log includes the number of dropped events.
- [ ] Verify `stop()` calls `clearInterval` before the final `flush()` to prevent a double-flush.
- [ ] Confirm that the buffer is started in `agent-runner.ts` and stopped (awaited) in the finally block of the agent execution try/catch to ensure the final thought is never lost.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test --workspace=packages/orchestrator -- --testPathPattern=thought-batching-buffer` and confirm all tests pass.
- [ ] Run the full orchestrator test suite `npm test --workspace=packages/orchestrator` and confirm no regressions.

## 5. Update Documentation

- [ ] Create `packages/orchestrator/src/streaming/thought-batching-buffer.agent.md` documenting:
  - The rationale for buffering only `ThoughtEnvelope` events (LLM token-by-token streaming generates O(100) events/sec, while Action and Observation events are low-frequency and latency-sensitive).
  - The `flushIntervalMs: 16` default and its relationship to 60FPS rendering targets.
  - The `maxBufferSize` overflow strategy (head-drop) and the `"buffer_overflow"` event.
  - Instructions to wire the buffer in `agent-runner.ts`.

## 6. Automated Verification

- [ ] Run `npm test --workspace=packages/orchestrator -- --testPathPattern=thought-batching-buffer --coverage` and confirm `thought-batching-buffer.ts` has ≥ 90% line coverage.
- [ ] Run `npm run build --workspace=packages/orchestrator` and confirm zero TypeScript errors.
