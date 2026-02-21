# Task: Implement Background Indexing Throttle for LanceDB Vector Store (Sub-Epic: 18_Performance_and_Benchmarking)

## Covered Requirements
- [8_RISKS-REQ-037]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/indexing-throttle.test.ts`, write unit tests for a `ThrottledIndexer` class:
  - Test that `ThrottledIndexer` accepts a `maxConcurrentIndexingOps: number` configuration option (e.g., `1`).
  - Test that when an active agent implementation turn is in progress (signaled via a shared `AgentStateStore`), no new indexing operations are dispatched.
  - Test that when no active agent turn is in progress, indexing operations are enqueued and processed up to the `maxConcurrentIndexingOps` limit.
  - Test that calling `ThrottledIndexer.enqueue(record)` while at capacity returns a Promise that resolves only after a slot becomes available.
  - Test that CPU-spike mitigation is measurable: simulate 100 rapid `enqueue` calls and assert that no more than `maxConcurrentIndexingOps` are executing simultaneously at any point (use fake timers and spies).
  - Write an integration test (using a LanceDB in-memory table) that verifies indexed records appear in the table only after the throttle releases them.

## 2. Task Implementation
- [ ] Create `packages/memory/src/indexing/ThrottledIndexer.ts`:
  - Define interface `ThrottledIndexerConfig { maxConcurrentIndexingOps: number; agentStateStore: AgentStateStore; }`.
  - Implement a queue-based throttle: maintain an internal `activeCount` counter and a `queue: Array<() => Promise<void>>`.
  - Expose `enqueue(indexFn: () => Promise<void>): Promise<void>` — if an agent turn is active OR `activeCount >= maxConcurrentIndexingOps`, push to queue; otherwise run immediately.
  - Subscribe to `AgentStateStore` events (`'turn:start'`, `'turn:end'`) to pause/resume draining the queue.
  - After each indexing operation completes, decrement `activeCount` and call `drain()` to dequeue the next pending operation (if agent is idle).
- [ ] Create `packages/memory/src/indexing/AgentStateStore.ts`:
  - Implement a simple `EventEmitter`-based singleton with `setTurnActive(active: boolean)` and `isTurnActive(): boolean`.
  - Emit `'turn:start'` / `'turn:end'` events so `ThrottledIndexer` can subscribe.
- [ ] Wire `ThrottledIndexer` into the existing `VectorStore` upsert path in `packages/memory/src/VectorStore.ts`:
  - Replace direct LanceDB `table.add(records)` calls with `throttledIndexer.enqueue(() => table.add(records))`.
  - Export a default singleton `ThrottledIndexer` configured with `maxConcurrentIndexingOps: 1`.
- [ ] Integrate `AgentStateStore.setTurnActive(true/false)` calls in the agent execution loop (`packages/orchestrator/src/AgentRunner.ts`) at the start and end of each implementation turn.

## 3. Code Review
- [ ] Verify that `ThrottledIndexer` has zero direct imports of LanceDB internals — it must depend only on a generic `() => Promise<void>` callback pattern.
- [ ] Confirm the `AgentStateStore` uses the Observer/EventEmitter pattern (not polling) to minimize overhead.
- [ ] Ensure no `async` constructor patterns; initialization must be synchronous with a separate async `init()` method if needed.
- [ ] Verify TypeScript strict mode compliance (`noImplicitAny`, `strictNullChecks`).
- [ ] Confirm there are no unbounded queue growth issues — document that the queue is intentionally unbounded but all enqueued items will eventually execute.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="indexing-throttle"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/memory test -- --coverage` and confirm coverage for `ThrottledIndexer.ts` and `AgentStateStore.ts` is ≥ 90%.

## 5. Update Documentation
- [ ] Update `packages/memory/src/indexing/ThrottledIndexer.ts` with a JSDoc header explaining the throttle contract, referencing `[8_RISKS-REQ-037]`.
- [ ] Add a section "Background Indexing Throttle" to `packages/memory/AGENT.md` (create if absent) describing: the purpose, the `AgentStateStore` integration point, and the configuration option `maxConcurrentIndexingOps`.
- [ ] Update the Phase 4 memory architecture notes in `.devs/memory/phase_4_decisions.md` (create if absent) to record: "LanceDB indexing is throttled via `ThrottledIndexer`; max 1 concurrent op during agent turns."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test 2>&1 | tail -5` and confirm the final line contains `Tests: X passed` with zero failures.
- [ ] Run `grep -r "ThrottledIndexer" packages/memory/src/VectorStore.ts` and confirm the import and usage exist, proving the throttle is wired into the production path.
- [ ] Run `grep -r "setTurnActive" packages/orchestrator/src/AgentRunner.ts` and confirm two occurrences (one for `true`, one for `false`), proving the agent loop is integrated.
