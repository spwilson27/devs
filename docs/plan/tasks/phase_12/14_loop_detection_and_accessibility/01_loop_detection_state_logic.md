# Task: Loop Detection State Logic – Track Task Retry Counts and Emit Loop Events (Sub-Epic: 14_Loop Detection and Accessibility)

## Covered Requirements
- [4_USER_FEATURES-REQ-063]

## 1. Initial Test Written
- [ ] In `packages/core/src/orchestrator/__tests__/loopDetector.test.ts`, write unit tests covering:
  - A new `LoopDetector` class (or module) that accepts a task ID and a retry count threshold configuration (`{ warnAt: 3, errorAt: 5 }`).
  - `recordAttempt(taskId: string): LoopStatus` increments the internal counter for `taskId` and returns `'ok'`, `'warn'`, or `'error'` based on thresholds.
  - After 1–2 attempts: returns `'ok'`.
  - After 3rd attempt: returns `'warn'`.
  - After 5th attempt: returns `'error'`.
  - `reset(taskId: string)` clears the counter for a given task and subsequent `recordAttempt` calls return `'ok'` again.
  - `getStatus(taskId: string)` returns the current `LoopStatus` without incrementing.
  - The detector emits a typed event (`loop:warn` and `loop:error`) on the project `EventBus` when thresholds are crossed (integration test with a mock `EventBus`).
  - All counters are cleared when `resetAll()` is called (e.g., on a new project session).

## 2. Task Implementation
- [ ] Create `packages/core/src/orchestrator/loopDetector.ts`:
  - Export type `LoopStatus = 'ok' | 'warn' | 'error'`.
  - Export type `LoopThresholds = { warnAt: number; errorAt: number }`.
  - Export class `LoopDetector` that maintains a `Map<string, number>` of attempt counts per task ID.
  - Constructor accepts `thresholds: LoopThresholds` and an `eventBus: IEventBus` reference.
  - `recordAttempt(taskId)`: increments count, computes status, emits `loop:warn` or `loop:error` event (with payload `{ taskId, attemptCount }`) only when the threshold is **first crossed** (not on every subsequent call), returns status.
  - `getStatus(taskId)`: reads current count and returns status without emitting.
  - `reset(taskId)`: deletes the key from the map.
  - `resetAll()`: clears the entire map.
- [ ] Export `LoopDetector` from `packages/core/src/index.ts`.
- [ ] Add `loop:warn` and `loop:error` to the `EventBusEventMap` type in `packages/core/src/eventBus/types.ts` with payload type `{ taskId: string; attemptCount: number }`.
- [ ] Register a singleton `LoopDetector` instance in the orchestrator's dependency injection container (`packages/core/src/orchestrator/container.ts`) using the project's default thresholds (`warnAt: 3, errorAt: 5`).
- [ ] Integrate `loopDetector.recordAttempt(task.id)` at the point in the orchestrator task-execution loop where a task is retried (e.g., in `packages/core/src/orchestrator/taskRunner.ts`).

## 3. Code Review
- [ ] Verify the `LoopDetector` is a pure, stateful class with no direct UI or framework dependencies (core layer must not import React or VS Code APIs).
- [ ] Confirm threshold-crossing events are emitted **exactly once** per threshold boundary, not on every subsequent retry.
- [ ] Ensure `resetAll()` is wired to the project session lifecycle (called on new project load / orchestrator reset).
- [ ] Confirm `LoopStatus` type is exported and documented with JSDoc.
- [ ] Confirm no raw `any` types are used in the implementation.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=loopDetector` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/core test -- --coverage` and verify `loopDetector.ts` achieves ≥90% line coverage.

## 5. Update Documentation
- [ ] Add a `## Loop Detection` section to `packages/core/README.md` explaining the `LoopDetector` API, default thresholds, and how to subscribe to `loop:warn` / `loop:error` events via the `EventBus`.
- [ ] Update `docs/architecture/core-orchestrator.md` (or create it) to include a note that the orchestrator emits loop lifecycle events at configured thresholds.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --ci --forceExit` and assert exit code `0`.
- [ ] Run `grep -r "loop:warn\|loop:error" packages/core/src/eventBus/types.ts` to confirm the event types are registered in the type map.
- [ ] Run `grep -r "loopDetector.recordAttempt" packages/core/src/orchestrator/taskRunner.ts` to confirm integration is in place.
