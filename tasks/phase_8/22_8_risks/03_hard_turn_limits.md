# Task: Implement Hard Turn Limits (10 per task) (Sub-Epic: 22_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-004]

## 1. Initial Test Written
- [ ] Write unit and integration tests that prove the DeveloperAgent enforces a hard per-task turn limit of 10 and transitions the task into a suspended state when exceeded:
  - Tests to write FIRST:
    - test_turn_limit_reached: emulate invoking DeveloperAgent.take_turn(task_id) 11 times; assert the 11th call returns or raises a well-defined `TurnLimitReached` error or sets task state to `suspended` and does not execute a new turn.
    - test_turn_count_persistence: after 5 turns, simulate a restart (re-instantiate the agent with persisted state) and assert the saved turn_count remains 5.
    - test_no_overflow_with_concurrent_turns: simulate two parallel workers attempting to increment turn_count concurrently and assert atomicity (no double-counting beyond one increment per turn) using a mocked FileLockManager.
  - Test locations: `tests/test_turn_limits.py` or `tests/turn-limits.test.ts` depending on test framework.

## 2. Task Implementation
- [ ] Implement per-task hard turn limit enforcement in the DeveloperAgent execution loop and persist turn counts atomically:
  - Technical changes:
    - Add `turn_count` and `max_turns` fields to the TaskState model; default `max_turns` = 10.
    - Before executing a turn, DeveloperAgent must acquire a per-task lock (FileLockManager.acquire(task_id)) then read, increment and persist `turn_count` atomically; release lock after increment.
    - If turn_count >= max_turns, DeveloperAgent must set task status to `suspended` and emit a `turn_limit_reached` event; do NOT perform the turn.
    - Provide a `TurnLimitReached` typed exception or well-known return object {status: 'suspended', reason: 'turn_limit_reached'} to downstream callers.
    - Ensure turn_count persistence uses the same CommitNode/SQLite pattern used elsewhere (atomic commit + git commit if applicable).
  - Concurrency and atomicity:
    - Use FileLockManager or DB-level transactions to ensure increments are atomic in concurrent scenarios.
    - Tests should mock locking to simulate contention.

## 3. Code Review
- [ ] During review ensure:
  - Atomic increment operation is implemented and tested.
  - No race conditions: validate locking usage and scope of lock holds.
  - Clear, typed error/return shape on limit hit and consistent event emission.
  - Default max_turns = 10 is configurable via config/task_limits.yaml and documented.

## 4. Run Automated Tests to Verify
- [ ] Run the turn-limits tests locally and in CI:
  - pytest: `pytest -q tests/test_turn_limits.py`.
  - jest: `npx jest tests/turn-limits.test.ts`.
  - Verify the concurrency test also passes under CI environment using mocked locks.

## 5. Update Documentation
- [ ] Add `docs/risks/turn_limits.md` describing:
  - Rationale for hard turn limits.
  - Config names and default values (`max_turns: 10`).
  - Developer workflow for resuming a suspended task and manual override procedures.

## 6. Automated Verification
- [ ] Add `scripts/verify_turn_limits.sh` that:
  - Starts a local test harness, runs 11 sequential turn invocations and asserts the 11th invocation returns `suspended`.
  - Optionally runs the concurrency test using the provided mock FileLockManager to assert atomic increments.
  - Exit non-zero on verification failures.
