# Task: Escalation Pause State Machine (Sub-Epic: 20_Security Alert Table and Escalation UI)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-083]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/escalationGuard.test.ts`, write unit tests for an `EscalationGuard` class:
  - Test that `recordFailedAttempt(taskId: string)` increments the failure counter for that task in the in-memory map.
  - Test that after exactly 5 calls to `recordFailedAttempt` for the same `taskId`, `shouldEscalate(taskId)` returns `true`.
  - Test that before 5 failures, `shouldEscalate(taskId)` returns `false`.
  - Test that `getAttemptCount(taskId)` returns the correct integer count.
  - Test that `reset(taskId)` clears the counter so subsequent `shouldEscalate` calls return `false`.
  - Test that `getEscalatedTasks()` returns only task IDs that have reached or exceeded the threshold.
  - Write integration tests in `src/orchestrator/__tests__/taskRunner.escalation.test.ts`:
    - Mock the `TaskRunner` so that the implementation agent always returns a failure result.
    - Assert that after 5 failures, the `TaskRunner` emits an `'escalation'` event with payload `{ taskId, attemptCount: 5, state: 'PAUSED_FOR_INTERVENTION' }`.
    - Assert that after emitting `'escalation'`, the `TaskRunner` does NOT attempt a 6th run for that task without explicit `resume(taskId)` call.
    - Assert that `resume(taskId)` resets the failure counter and allows the task to be re-attempted.
  - All tests must be written and failing before any implementation begins.

## 2. Task Implementation
- [ ] Create `src/orchestrator/escalationGuard.ts`:
  - `ESCALATION_THRESHOLD = 5` constant (exported for testability).
  - `EscalationGuard` class with private `Map<string, number>` for attempt counts.
  - Methods: `recordFailedAttempt(taskId)`, `shouldEscalate(taskId): boolean`, `getAttemptCount(taskId): number`, `reset(taskId)`, `getEscalatedTasks(): string[]`.
  - Export a singleton `escalationGuard` instance.
- [ ] Modify `src/orchestrator/taskRunner.ts`:
  - Inject `EscalationGuard` dependency (accept as constructor param, default to singleton).
  - After each implementation agent failure in the TDD loop, call `escalationGuard.recordFailedAttempt(task.id)`.
  - Before scheduling the next attempt, check `escalationGuard.shouldEscalate(task.id)`. If `true`:
    - Update task state to `PAUSED_FOR_INTERVENTION` in the SQLite `tasks` table: `UPDATE tasks SET status = 'PAUSED_FOR_INTERVENTION' WHERE id = ?`.
    - Emit `'escalation'` event via `this.emit('escalation', { taskId, attemptCount, state: 'PAUSED_FOR_INTERVENTION' })`.
    - Return without scheduling further attempts.
  - Implement a `resume(taskId: string)` method that:
    - Calls `escalationGuard.reset(taskId)`.
    - Sets task status back to `PENDING` in the DB.
    - Re-enqueues the task for execution.
- [ ] Add `PAUSED_FOR_INTERVENTION` as a valid value in the `tasks.status` CHECK constraint (add a migration `0XY_add_paused_status.sql` if the constraint is hardcoded).
- [ ] Expose `resume(taskId)` through the MCP tool `rewind_to_task` (or a new `resume_task` tool) in `src/mcp/tools/resumeTask.ts`.

## 3. Code Review
- [ ] Verify `ESCALATION_THRESHOLD` is a named constant, not a magic number `5` inline.
- [ ] Verify the `TaskRunner` does not bypass the guard – confirm no code path schedules a 6th attempt without calling `resume`.
- [ ] Verify the `'escalation'` event payload matches the documented type `{ taskId: string; attemptCount: number; state: 'PAUSED_FOR_INTERVENTION' }`.
- [ ] Verify the SQLite status update uses a parameterized statement.
- [ ] Verify `EscalationGuard` has no I/O or DB dependencies – it is pure in-memory state, making it synchronous and trivially testable.
- [ ] Confirm the `resume` path properly resets both in-memory state AND the DB status atomically (use a SQLite transaction).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="escalationGuard|taskRunner.escalation"` and confirm all tests pass.
- [ ] Run `npm run lint` and `npm run typecheck` with zero errors.

## 5. Update Documentation
- [ ] Create `src/orchestrator/escalationGuard.agent.md`:
  - Document the escalation threshold (5 attempts).
  - Document the `PAUSED_FOR_INTERVENTION` state and how it surfaces to the user.
  - Document the `resume(taskId)` flow.
- [ ] Update `src/orchestrator/taskRunner.agent.md` to reference the escalation guard and describe the `'escalation'` event.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="escalationGuard|taskRunner.escalation" --coverage` and confirm coverage ≥ 90% for `src/orchestrator/escalationGuard.ts`.
- [ ] Run the integration test scenario end-to-end: `npx ts-node scripts/simulate-escalation.ts` (create this script to mock 5 failures and verify the DB row shows `PAUSED_FOR_INTERVENTION`).
