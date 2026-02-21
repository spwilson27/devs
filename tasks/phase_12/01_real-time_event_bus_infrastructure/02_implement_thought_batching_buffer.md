# Task: Implement Thought Batching Buffer for High-Frequency Event Coalescing (Sub-Epic: 01_Real-time Event Bus Infrastructure)

## Covered Requirements
- [TAS-038], [9_ROADMAP-REQ-037]

## 1. Initial Test Written
- [ ] Create `packages/core/src/event-bus/__tests__/thought-batching-buffer.test.ts`.
- [ ] Write a unit test that publishes 500 `THOUGHT_STREAM` events within 16ms (one frame budget) and asserts the buffer flushes them as a single batched array, not 500 individual calls — mock the downstream flush callback and assert it was called exactly once with an array of 500 items.
- [ ] Write a unit test verifying the buffer respects a configurable `maxBatchSize`: when `maxBatchSize = 50` and 120 events arrive before the flush interval, the buffer flushes twice (50 + 50) immediately and holds the remaining 20 for the next tick.
- [ ] Write a unit test verifying the buffer auto-flushes after `flushIntervalMs` (default 16ms) even if `maxBatchSize` has not been reached — use `vi.useFakeTimers()` and advance time by 16ms.
- [ ] Write a unit test verifying that calling `ThoughtBatchingBuffer.flush()` manually triggers an immediate flush, resetting the pending queue and the timer.
- [ ] Write a unit test verifying that events from different `agentId` values within the same batch are preserved in order and not interleaved incorrectly.
- [ ] Write a unit test verifying that if the downstream flush callback throws, the error is caught, logged via the injected `logger`, and the buffer resets — it must not crash the process.
- [ ] Write a unit test verifying that `ThoughtBatchingBuffer.destroy()` clears any pending timer and prevents further flushes after teardown.
- [ ] All tests must use `vitest` with `vi.useFakeTimers()` for timer control. No real timers allowed in unit tests.

## 2. Task Implementation
- [ ] Create `packages/core/src/event-bus/thought-batching-buffer.ts`:
  - Export `ThoughtBatchingBufferOptions` interface: `{ maxBatchSize?: number; flushIntervalMs?: number; logger?: Logger; }` where defaults are `maxBatchSize = 100` and `flushIntervalMs = 16`.
  - Export `ThoughtBatchingBuffer` class:
    - Constructor accepts `onFlush: (batch: DevsEvent[]) => void` callback and `ThoughtBatchingBufferOptions`.
    - Internal queue: `DevsEvent[]`.
    - Internal timer: a `NodeJS.Timeout` handle reset on every flush.
    - Method `push(event: DevsEvent): void` — appends event to the queue; if `queue.length >= maxBatchSize`, calls `this.flush()` immediately.
    - Method `flush(): void` — clears the timer, copies and empties the queue, calls `onFlush(batch)` inside a try/catch (logs error on failure), then restarts the interval timer.
    - Method `destroy(): void` — clears the timer, empties the queue, sets an internal `destroyed` flag; subsequent `push` calls are no-ops.
  - The class must NOT import anything from the WebSocket or network layer.
- [ ] Wire `ThoughtBatchingBuffer` into `EventBus`: when `EventBus.publish()` is called with a `THOUGHT_STREAM` event, instead of immediately calling downstream transport handlers, enqueue it into the buffer. Non-`THOUGHT_STREAM` events bypass the buffer and are dispatched immediately.
- [ ] Expose `EventBus.setThoughtBuffer(buffer: ThoughtBatchingBuffer): void` to allow the WebSocket bridge to inject its own buffer instance (facilitates testability and per-transport buffering).
- [ ] Update `packages/core/src/event-bus/index.ts` to export `ThoughtBatchingBuffer` and `ThoughtBatchingBufferOptions`.

## 3. Code Review
- [ ] Verify that the buffer does NOT hold a reference to the `EventBus` singleton (one-directional dependency to avoid circular refs).
- [ ] Verify that `flush()` is idempotent: calling it twice in rapid succession does not result in double-dispatch of events.
- [ ] Verify that `push()` is synchronous and does not await any promise — the buffer must never block the LangGraph execution thread.
- [ ] Verify timer logic: the interval timer must be reset (clearTimeout + setTimeout) on each flush, not accumulated.
- [ ] Verify the `destroyed` flag is checked in `push()`, `flush()`, and the timer callback to prevent post-teardown side effects.
- [ ] Confirm there are no `any` types in the implementation; all generics are properly constrained to `DevsEvent`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test src/event-bus/__tests__/thought-batching-buffer.test.ts` and confirm all tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/core test --coverage` and verify line coverage for `src/event-bus/thought-batching-buffer.ts` is ≥ 95%.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a subsection `### Thought Batching Buffer` under `## Event Bus` in `packages/core/README.md`, documenting: the purpose (bridge saturation prevention), configuration options (`maxBatchSize`, `flushIntervalMs`), and the injection pattern via `EventBus.setThoughtBuffer()`.
- [ ] Update `docs/architecture/event-bus.md` with a Mermaid sequence diagram showing: `LangGraph Agent → EventBus.publish() → ThoughtBatchingBuffer → onFlush callback → Transport Bridge`.
- [ ] Append to `docs/agent-memory/decisions.md`: "Phase 12 / Task 02 — `ThoughtBatchingBuffer` coalesces THOUGHT_STREAM events into 16ms (1-frame) batches with a max batch size of 100 before dispatching to transport bridges. Non-THOUGHT_STREAM events bypass the buffer."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --reporter=json --outputFile=test-results/thought-batching-buffer.json` and assert the JSON contains `"numFailedTests": 0`.
- [ ] Run a micro-benchmark script `scripts/bench/thought-buffer-bench.ts` (create it): publish 10,000 `THOUGHT_STREAM` events as fast as possible and assert the `onFlush` callback is called ≤ 110 times (i.e., batching is effective). Print result to stdout. Fail the script with `process.exit(1)` if the assertion fails.
