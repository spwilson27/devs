# Task: Implement budget-hit recovery workflow (Sub-Epic: 27_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-090]

## 1. Initial Test Written
- [ ] Detect repo language/test runner and write tests in that stack.
- [ ] Create tests that simulate a paused task due to budget threshold and verify recovery after top-up:
  - tests/risks/test_budget_recovery.py (pytest):
    - Setup: configure BudgetManager with budget=1000 and threshold 0.8.
    - Simulate consumption to reach paused state; record a StatePreserver snapshot for the task and create a RecoveryRecord in a test `recovery` table.
    - Call RecoveryManager.resume(task_id) after calling BudgetManager.top_up(task_id, amount) to exceed threshold.
    - Assert RecoveryManager restores state via StatePreserver.load(snapshot_hash) and re-enqueues a DeveloperAgent task with preserved test context (validate an entry in the in-memory TaskQueue or tasks DB with state `ready`).
  - Node/TS: equivalent test using jest.
- [ ] Test names: `test_recovery_restores_state_after_top_up`, `test_recovery_idempotency`.

## 2. Task Implementation
- [ ] Implement `src/risks/recovery.{py,ts}` with:
  - class RecoveryManager:
    - pause_handler(task_id): invoked by BudgetManager when pausing a task; store snapshot hash, persisted snapshot reference, paused_at, attempt_count in `recovery` table.
    - resume_handler(task_id): verifies budget sufficiency, validates snapshot integrity (compute hash and match stored hash), restores using StatePreserver.load -> inject restored state into sandbox, and re-enqueue the task in DeveloperAgent queue with the preserved TDD context (failing test, last attempted commit, task metadata).
    - guardrails: max_resume_attempts (configurable) to avoid infinite resume loops.
- [ ] Ensure audit trail: all resume and pause events are appended to `recovery_events(id, task_id, event_type, payload, created_at)`.
- [ ] Integration: BudgetManager.top_up must trigger a check to RecoveryManager to auto-resume any paused tasks for which budget is now sufficient.

## 3. Code Review
- [ ] Verify idempotency: calling resume_handler repeatedly without intervening state changes should not cause duplicate queue entries or corrupt state.
- [ ] Verify snapshot integrity checks (hash match) before any restore; fail fast and emit detailed alert if mismatch.
- [ ] Ensure proper locking around re-enqueue to avoid race conditions.

## 4. Run Automated Tests to Verify
- [ ] Run the budget recovery tests:
  - Python: `pytest tests/risks/test_budget_recovery.py -q`.
  - Node: `npx jest tests/risks/budget-recovery.test.ts --runInBand`.
- [ ] Verify tests assert that the DeveloperAgent queue has an entry in `ready` state after successful resume.

## 5. Update Documentation
- [ ] Add `docs/tasks/phase_8/27_8_risks/05_budget_recovery.md` describing the pause/resume lifecycle, table schemas (`recovery`, `recovery_events`), configuration knobs (`max_resume_attempts`) and example CLI recovery commands (`devs recovery resume --task <id>`).

## 6. Automated Verification
- [ ] Add `scripts/verify_recovery_after_budget.sh` which:
  - Simulates budget exhaustion, ensures task is paused and snapshot persisted,
  - Performs top-up, calls RecoveryManager.resume, and asserts state restored and task re-enqueued.
  - Exits with non-zero on verification failure.
